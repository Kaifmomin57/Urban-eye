import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser
} from "firebase/auth";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { auth, db, googleProvider, githubProvider } from "../lib/firebase";
import { getOrCreateUserProfile, UserProfile, updateUserProfile } from "../lib/userService";
import { logActivity, subscribeToActivities, UserActivity } from "../lib/activityService";
import { Issue, ISSUES } from "../data/mockData";

type ThemeName = "default" | "blue-steel";

interface AppContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  issues: Issue[];
  activities: UserActivity[];
  theme: ThemeName;
  toggleTheme: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  addIssue: (issue: Omit<Issue, "id">) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  upvoteIssue: (id: string) => Promise<void>;
  updateIssueStatus: (id: string, status: Issue["status"]) => Promise<void>;
  reportFakeIssue: (id: string, reason: string) => Promise<void>;
  updateProfile: (data: { name?: string; photoURL?: string }) => Promise<void>;
  redeemReward: (cost: number) => Promise<string>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [issues, setIssues] = useState<Issue[]>(ISSUES);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "default";
    const saved = window.localStorage.getItem("urbanEyeTheme");
    return saved === "blue-steel" ? "blue-steel" : "default";
  });

  // Apply/remove the theme class on <html> and persist the choice
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "blue-steel") {
      root.classList.add("theme-blue-steel");
    } else {
      root.classList.remove("theme-blue-steel");
    }
    try {
      window.localStorage.setItem("urbanEyeTheme", theme);
    } catch {
      // localStorage may be unavailable (e.g. private browsing) — ignore
    }
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === "blue-steel" ? "default" : "blue-steel"));
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const profile = await getOrCreateUserProfile(fbUser);
          setUser(profile);
        } else {
          setFirebaseUser(null);
          setUser(null);
          setActivities([]);
        }
      } catch (err) {
        console.warn("Auth state error:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // Subscribe to issues
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Issue));
        if (fetched.length > 0) {
          setIssues(fetched);
        } else {
          setIssues(ISSUES);
        }
      },
      (error) => {
        console.warn("Firestore access restricted for issues, using mock data:", error);
        setIssues(ISSUES);
      }
    );
    return unsub;
  }, []);

  // Subscribe to current user's activity feed (for heatmap)
  useEffect(() => {
    if (!user?.uid) {
      setActivities([]);
      return;
    }
    const unsub = subscribeToActivities(user.uid, setActivities);
    return unsub;
  }, [user?.uid]);

  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  async function loginWithGithub() {
    await signInWithPopup(auth, githubProvider);
  }

  async function logout() {
    await signOut(auth);
  }

  async function addIssue(issue: Omit<Issue, "id">) {
    if (!user) return;
    const tempId = `issue-${Date.now()}`;
    const newIssue: Issue = { ...issue, id: tempId };
    setIssues(prev => [newIssue, ...prev]);

    const newPoints = (user.points || 0) + 50;
    const newReportsFiled = (user.reportsFiled || 0) + 1;
    setUser(u => u ? { ...u, points: newPoints, reportsFiled: newReportsFiled } : u);

    try {
      const docRef = await addDoc(collection(db, "issues"), {
        ...issue,
        reportedBy: user.uid,
        reportedByName: user.name,
        createdAt: serverTimestamp()
      });
      await updateUserProfile(user.uid, { points: newPoints, reportsFiled: newReportsFiled });
      logActivity(user.uid, "issue_reported", `Reported: ${issue.title}`, docRef.id);
    } catch (err) {
      console.warn("Firestore error adding issue:", err);
    }
  }

  // Deletes the issue doc and deducts 50 points from the poster's profile.
  async function deleteIssue(id: string) {
    if (!user) return;
    const issue = issues.find(i => i.id === id);
    setIssues(prev => prev.filter(i => i.id !== id));

    const newPoints = Math.max(0, (user.points || 0) - 50);
    const newReportsFiled = Math.max(0, (user.reportsFiled || 0) - 1);
    setUser(u => u ? { ...u, points: newPoints, reportsFiled: newReportsFiled } : u);

    try {
      await deleteDoc(doc(db, "issues", id));
      await updateUserProfile(user.uid, { points: newPoints, reportsFiled: newReportsFiled });
      logActivity(user.uid, "issue_deleted", `Deleted: ${issue?.title || "an issue"}`, id);
    } catch (err) {
      console.warn("Firestore error deleting issue:", err);
    }
  }

  async function upvoteIssue(id: string) {
    if (!user) return;
    const current = issues.find(i => i.id === id);
    if (!current) return;

    setIssues(prev => prev.map(i => i.id === id ? { ...i, votes: (i.votes || 0) + 1 } : i));

    try {
      const ref = doc(db, "issues", id);
      await updateDoc(ref, { votes: (current.votes || 0) + 1 });
      logActivity(user.uid, "issue_upvoted", `Upvoted: ${current.title}`, id);
    } catch (err) {
      console.warn("Firestore error upvoting issue:", err);
    }
  }

  async function updateIssueStatus(id: string, status: Issue["status"]) {
    if (!user) return;
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    const issue = issues.find(i => i.id === id);

    try {
      await updateDoc(doc(db, "issues", id), { status });
      logActivity(user.uid, "status_changed", `Changed status to ${status.replace("_", " ")}: ${issue?.title || "an issue"}`, id);
    } catch (err) {
      console.warn("Firestore error updating status:", err);
    }
  }

  async function reportFakeIssue(id: string, reason: string) {
    const current = issues.find(i => i.id === id);
    if (!current) return;

    try {
      const ref = doc(db, "issues", id);
      const reports = (current as any).fakeReports || [];
      await updateDoc(ref, {
        fakeReports: [...reports, { by: user?.uid, reason, at: new Date().toISOString() }]
      });
      if (user) logActivity(user.uid, "fake_reported", `Reported fake: ${current.title}`, id);
    } catch (err) {
      console.warn("Firestore error reporting fake issue:", err);
    }
  }

  async function updateProfile(data: { name?: string; photoURL?: string }) {
    if (!user) return;
    setUser(u => u ? { ...u, ...data } : u);

    try {
      await updateUserProfile(user.uid, data);
      logActivity(user.uid, "profile_updated", "Updated profile");
    } catch (err) {
      console.warn("Firestore error updating profile:", err);
    }
  }

  async function redeemReward(cost: number): Promise<string> {
    if (!user) throw new Error("You need to sign in to redeem rewards.");
    if ((user.points || 0) < cost) throw new Error("Not enough points to redeem this reward.");
    const code = `URB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const newPoints = user.points - cost;
    setUser(u => u ? { ...u, points: newPoints } : u);

    try {
      await updateUserProfile(user.uid, { points: newPoints });
      logActivity(user.uid, "reward_redeemed", `Redeemed reward for ${cost} points`);
    } catch (err) {
      console.warn("Firestore error redeeming reward:", err);
    }

    return code;
  }

  return (
    <AppContext.Provider value={{
      user, firebaseUser, loading, issues, activities,
      theme, toggleTheme,
      loginWithGoogle, loginWithGithub, logout,
      addIssue, deleteIssue, upvoteIssue, updateIssueStatus,
      reportFakeIssue, updateProfile, redeemReward
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
