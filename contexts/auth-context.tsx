"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
  sendPasswordResetEmail,
  updateEmail as updateFirebaseEmail,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  profileImage?: string | null;
  provider: "email" | "google";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; photoURL?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect after auth state change
  useEffect(() => {
    if (!loading && user) {
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/");
      }
    }
  }, [user, loading, router, searchParams]);

  useEffect(() => {
    // Set session persistence
    setPersistence(auth, browserSessionPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token
        const idToken = await firebaseUser.getIdToken();
        
        // Set the session cookie via an API endpoint
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          profileImage: firebaseUser.photoURL,
          provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
        };
        setUser(user);
      } else {
        setUser(null);
        // Clear the session cookie
        await fetch('/api/auth/session', { method: 'DELETE' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Router push will happen in useEffect after auth state changes
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name if provided
      if (name && userCredential.user) {
        await updateFirebaseProfile(userCredential.user, {
          displayName: name
        });
      }

      // Get the ID token right after sign-up
      const idToken = await userCredential.user.getIdToken();
      
      // Set the session cookie
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      // Router push will happen in useEffect after auth state changes
    } catch (error: any) {
      console.error('Sign-up error:', error);
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Router push will happen in useEffect after auth state changes
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/welcome");
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; photoURL?: string }) => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }

    try {
      // Update display name and photo URL if provided
      if (data.name || data.photoURL) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.name || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL,
        });
      }

      // Update email if provided
      if (data.email && data.email !== auth.currentUser.email) {
        await updateFirebaseEmail(auth.currentUser, data.email);
      }

      // Update local user state
      if (auth.currentUser) {
        setUser({
          id: auth.currentUser.uid,
          email: auth.currentUser.email,
          name: auth.currentUser.displayName,
          profileImage: auth.currentUser.photoURL,
          provider: auth.currentUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
        });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error("No authenticated user");
    }

    try {
      // Re-authenticate user first
      await signInWithEmailAndPassword(auth, auth.currentUser.email, currentPassword);
      
      // Update password
      await updateFirebasePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut: handleSignOut,
        resetPassword,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
