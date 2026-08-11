import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: "citizen" | "ward" | "official";
  points: number;
  level: number;
  reportsFiled: number;
  reportsResolved: number;
  joinedAt: string;
  ward: string;
}

export async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const fallbackProfile: UserProfile = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "New Citizen",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    role: "citizen",
    points: 0,
    level: 1,
    reportsFiled: 0,
    reportsResolved: 0,
    joinedAt: new Date().toISOString(),
    ward: "Ward 1"
  };

  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    await setDoc(userRef, fallbackProfile);
    return fallbackProfile;
  } catch (err) {
    console.warn("Firestore access error in getOrCreateUserProfile, using fallback profile:", err);
    return fallbackProfile;
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
  } catch (err) {
    console.warn("Firestore access error in updateUserProfile:", err);
  }
}