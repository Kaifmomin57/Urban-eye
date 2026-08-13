import { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: "citizen" | "ward" | "official" | "field_employee";
  points: number;
  level: number;
  reportsFiled: number;
  reportsResolved: number;
  joinedAt: string;
  ward: string;
}

export async function getOrCreateUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const profile: UserProfile = {
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
  return profile;
}

export async function updateUserProfile(_uid: string, _data: Partial<UserProfile>) {
  // Local profile state management only
}