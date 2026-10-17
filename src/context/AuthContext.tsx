import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, testFirestoreConnection } from "../firebase/config";
import { handleFirestoreError, OperationType } from "../firebase/errorHandler";

export const ADMIN_EMAIL = "workumesafint2@gmail.com";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "editor" | "user";
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile & admin check
  const syncProfile = async (firebaseUser: User) => {
    const isUserAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const userDocRef = doc(db, "users", firebaseUser.uid);

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        setIsAdmin(isUserAdmin || data.role === "admin");
      } else {
        // Create initial profile
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "ጋዜጠኛ",
          role: isUserAdmin ? "admin" : "user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        setIsAdmin(isUserAdmin);

        // If admin, also write to /admins/{uid}
        if (isUserAdmin) {
          try {
            await setDoc(doc(db, "admins", firebaseUser.uid), {
              id: firebaseUser.uid,
              email: ADMIN_EMAIL,
              role: "admin",
              createdAt: new Date().toISOString(),
            });
          } catch {
            // Ignore if rules restrict
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Firestore:", err);
      // Fallback local profile state so user can still operate
      setProfile({
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "ጋዜጠኛ",
        role: isUserAdmin ? "admin" : "user",
      });
      setIsAdmin(isUserAdmin);
    }
  };

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    const isUserAdmin = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      await syncProfile(cred.user);
    } catch (err: any) {
      // If admin account doesn't exist yet on newly provisioned Firebase project, auto-create it!
      if (
        isUserAdmin &&
        (err?.code === "auth/invalid-credential" ||
          err?.code === "auth/user-not-found" ||
          err?.message?.includes("invalid-credential"))
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          const userDocRef = doc(db, "users", newCred.user.uid);
          const adminProfile: UserProfile = {
            id: newCred.user.uid,
            email: ADMIN_EMAIL,
            displayName: "ዋና አድሚን (Worku Mesafint)",
            role: "admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, adminProfile);
            await setDoc(doc(db, "admins", newCred.user.uid), {
              id: newCred.user.uid,
              email: ADMIN_EMAIL,
              role: "admin",
              createdAt: new Date().toISOString(),
            });
          } catch {
            // Ignore if rules restrict
          }
          setProfile(adminProfile);
          setIsAdmin(true);
          return;
        } catch (createErr) {
          console.warn("Admin auto-provision note:", createErr);
        }
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const cleanEmail = email.trim();
    const isUserAdmin = cleanEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);

      const userDocRef = doc(db, "users", cred.user.uid);
      const newProfile: UserProfile = {
        id: cred.user.uid,
        email: cleanEmail,
        displayName: name?.trim() || cleanEmail.split("@")[0],
        role: isUserAdmin ? "admin" : "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(userDocRef, newProfile);
        if (isUserAdmin) {
          await setDoc(doc(db, "admins", cred.user.uid), {
            id: cred.user.uid,
            email: ADMIN_EMAIL,
            role: "admin",
            createdAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Profile doc save error:", e);
      }

      setProfile(newProfile);
      setIsAdmin(isUserAdmin);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        // Attempt sign in with the provided password
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        await syncProfile(cred.user);
        return;
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    await syncProfile(cred.user);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut warning:", e);
    } finally {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
