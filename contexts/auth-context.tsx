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
import { sendEmail, EmailTemplate } from "@/lib/email-service"; // Import email service
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Assuming you have a Firestore db export

// Define anonymous trial settings
const MAX_TRIAL_CONVERSATIONS = 10;
const ANONYMOUS_ID_KEY = "pocketlawyer_anonymous_id";
const TRIAL_CONVERSATIONS_KEY = "pocketlawyer_trial_conversations";

// Email preferences interface
export interface EmailPreferences {
  systemUpdates: boolean;
  chatSummaries: boolean;
  trialNotifications: boolean;
  marketingEmails: boolean;
}

// Default email preferences
const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  systemUpdates: true,
  chatSummaries: true,
  trialNotifications: true,
  marketingEmails: false,
};

interface User {
  id: string;
  email: string | null;
  name: string | null;
  profileImage?: string | null;
  provider: "email" | "google" | "anonymous";
  isAnonymous?: boolean;
  trialConversationsUsed?: number;
  trialConversationsLimit?: number;
  emailPreferences?: EmailPreferences;
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
  updateEmailPreferences: (preferences: Partial<EmailPreferences>) => Promise<void>;
  sendEmailNotification: (template: EmailTemplate, data?: Record<string, any>) => Promise<boolean>;
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

  // Fetch user's email preferences from Firestore
  const fetchUserEmailPreferences = async (userId: string): Promise<EmailPreferences> => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data()?.emailPreferences) {
        return userDoc.data().emailPreferences as EmailPreferences;
      }
      
      // Initialize default preferences if none exist
      await updateDoc(userDocRef, { 
        emailPreferences: DEFAULT_EMAIL_PREFERENCES 
      });
      
      return DEFAULT_EMAIL_PREFERENCES;
    } catch (error) {
      console.error("Error fetching email preferences:", error);
      return DEFAULT_EMAIL_PREFERENCES;
    }
  };
  
  // Update user email preferences
  const updateEmailPreferences = async (preferences: Partial<EmailPreferences>): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user");
    }
    
    try {
      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userId);
      
      // Fetch current preferences
      const userDoc = await getDoc(userDocRef);
      const currentPreferences = userDoc.exists() && userDoc.data()?.emailPreferences
        ? userDoc.data().emailPreferences
        : DEFAULT_EMAIL_PREFERENCES;
        
      // Merge with new preferences
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };
      
      // Update in Firestore
      await updateDoc(userDocRef, {
        emailPreferences: updatedPreferences
      });
      
      // Update local user state
      setUser(prev => {
        if (prev) {
          return {
            ...prev,
            emailPreferences: updatedPreferences
          };
        }
        return prev;
      });
    } catch (error: any) {
      console.error("Error updating email preferences:", error);
      throw new Error(error.message);
    }
  };
  
  // Send email notification
  const sendEmailNotification = async (template: EmailTemplate, data?: Record<string, any>): Promise<boolean> => {
    if (!user || !user.email) {
      console.log("Cannot send email: No user or email");
      return false;
    }
    
    // For anonymous users, only allow trial notifications
    if (user.isAnonymous && template !== 'trial-reminder') {
      return false;
    }
    
    try {
      // Check user preferences for this email type
      let shouldSend = true;
      
      // If user has specific preferences and is not anonymous
      if (user.emailPreferences && !user.isAnonymous) {
        switch (template) {
          case 'system-update':
            shouldSend = user.emailPreferences.systemUpdates;
            break;
          case 'chat-summary':
            shouldSend = user.emailPreferences.chatSummaries;
            break;
          case 'trial-reminder':
            shouldSend = user.emailPreferences.trialNotifications;
            break;
          // Welcome and account verification emails are always sent
          case 'welcome':
          case 'account-verification':
          case 'reset-password':
            shouldSend = true;
            break;
          default:
            shouldSend = true;
        }
      }
      
      if (!shouldSend) {
        console.log(`Email notification skipped due to user preferences: ${template}`);
        return false;
      }
      
      // Send the email
      const result = await sendEmail({
        to: user.email,
        subject: getEmailSubject(template),
        template,
        data: {
          name: user.name,
          ...data
        }
      });
      
      return !!result.success;
    } catch (error) {
      console.error("Error sending email notification:", error);
      return false;
    }
  };
  
  // Helper function to get email subject based on template
  const getEmailSubject = (template: EmailTemplate): string => {
    switch (template) {
      case 'welcome':
        return "Welcome to PocketLawyer";
      case 'reset-password':
        return "Reset Your PocketLawyer Password";
      case 'chat-summary':
        return "Your Chat Summary from PocketLawyer";
      case 'system-update':
        return "PocketLawyer System Update";
      case 'trial-reminder':
        return "Your PocketLawyer Trial Status";
      case 'account-verification':
        return "Verify Your PocketLawyer Account";
      default:
        return "PocketLawyer Notification";
    }
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

        // Fetch email preferences for the user
        let emailPreferences: EmailPreferences | undefined;
        try {
          emailPreferences = await fetchUserEmailPreferences(firebaseUser.uid);
        } catch (error) {
          console.error("Failed to fetch email preferences:", error);
          // Use defaults if can't fetch
          emailPreferences = DEFAULT_EMAIL_PREFERENCES;
        }

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          profileImage: firebaseUser.photoURL,
          provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
          emailPreferences
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
      
      // Create user document with default email preferences
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        email,
        name: name || '',
        createdAt: new Date(),
        emailPreferences: DEFAULT_EMAIL_PREFERENCES
      }, { merge: true });
      
      // Send welcome email
      sendEmail({
        to: email,
        subject: "Welcome to PocketLawyer",
        template: "welcome",
        data: { name: name || 'there' }
      }).catch(error => {
        console.error("Error sending welcome email:", error);
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
        clearAnonymousSession,
        updateEmailPreferences,
        sendEmailNotification
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
