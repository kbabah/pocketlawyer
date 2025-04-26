"use client"

import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from "react";
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
import { v4 as uuidv4 } from "uuid";

// Define anonymous trial settings
const MAX_TRIAL_CONVERSATIONS = 10;
const ANONYMOUS_ID_KEY = "pocketlawyer_anonymous_id";
const TRIAL_CONVERSATIONS_KEY = "pocketlawyer_trial_conversations";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  profileImage?: string | null;
  provider: "email" | "google" | "anonymous";
  isAnonymous?: boolean;
  trialConversationsUsed?: number;
  trialConversationsLimit?: number;
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
  incrementTrialConversations: () => number;
  isTrialLimitReached: () => boolean;
  getTrialConversationsRemaining: () => number;
  clearAnonymousSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a separate component to use the searchParams
function AuthProviderContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  // Initialize or retrieve anonymous session
  const initAnonymousSession = () => {
    // Check for existing anonymous ID
    let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!anonymousId) {
      anonymousId = uuidv4();
      localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
      localStorage.setItem(TRIAL_CONVERSATIONS_KEY, "0");
    }
    
    const trialConversationsUsed = parseInt(localStorage.getItem(TRIAL_CONVERSATIONS_KEY) || "0", 10);
    
    return {
      id: anonymousId,
      email: null,
      name: "Guest User",
      provider: "anonymous" as const,
      isAnonymous: true,
      trialConversationsUsed,
      trialConversationsLimit: MAX_TRIAL_CONVERSATIONS
    };
  };
  
  // Increment conversation count for anonymous users
  const incrementTrialConversations = (): number => {
    if (!user?.isAnonymous) return 0;
    
    const currentCount = parseInt(localStorage.getItem(TRIAL_CONVERSATIONS_KEY) || "0", 10);
    const newCount = currentCount + 1;
    localStorage.setItem(TRIAL_CONVERSATIONS_KEY, newCount.toString());
    
    // Update user state
    setUser(prev => {
      if (prev && prev.isAnonymous) {
        return {
          ...prev,
          trialConversationsUsed: newCount
        };
      }
      return prev;
    });
    
    return newCount;
  };
  
  // Check if trial limit is reached
  const isTrialLimitReached = (): boolean => {
    if (!user?.isAnonymous) return false;
    
    const currentCount = parseInt(localStorage.getItem(TRIAL_CONVERSATIONS_KEY) || "0", 10);
    return currentCount >= MAX_TRIAL_CONVERSATIONS;
  };
  
  // Get remaining trial conversations
  const getTrialConversationsRemaining = (): number => {
    if (!user?.isAnonymous) return 0;
    
    const currentCount = parseInt(localStorage.getItem(TRIAL_CONVERSATIONS_KEY) || "0", 10);
    return Math.max(0, MAX_TRIAL_CONVERSATIONS - currentCount);
  };
  
  // Clear anonymous session data
  const clearAnonymousSession = () => {
    localStorage.removeItem(ANONYMOUS_ID_KEY);
    localStorage.removeItem(TRIAL_CONVERSATIONS_KEY);
  };

  // Handle redirect after INITIAL auth state change only
  useEffect(() => {
    if (!loading && user && !initialAuthChecked) {
      // Get callback URL if exists
      const callbackUrl = searchParams.get("callbackUrl");
      
      // Use a short timeout to ensure the auth state is fully processed
      setTimeout(() => {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          // Only redirect to the main chat interface on initial login
          // Not on profile updates or other auth state changes
          const currentPath = window.location.pathname;
          if (currentPath === "/sign-in" || currentPath === "/sign-up") {
            router.replace("/");
          }
        }
        setInitialAuthChecked(true);
      }, 100);
    }
  }, [user, loading, router, searchParams, initialAuthChecked]);

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
        
        // If user signed in, clear any anonymous session
        clearAnonymousSession();

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          profileImage: firebaseUser.photoURL,
          provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
        };
        setUser(user);
      } else {
        // No authenticated user, create or use anonymous session
        const anonymousUser = initAnonymousSession();
        setUser(anonymousUser);
        
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
        incrementTrialConversations,
        isTrialLimitReached,
        getTrialConversationsRemaining,
        clearAnonymousSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
