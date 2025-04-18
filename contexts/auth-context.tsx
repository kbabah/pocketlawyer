"use client"

import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence,
  updateProfile as updateFirebaseProfile,
  updatePassword as updateFirebasePassword,
  sendPasswordResetEmail,
  updateEmail as updateFirebaseEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

interface User {
  id: string
  email: string | null
  name: string | null
  profileImage?: string | null
  provider: "email" | "google"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: { name?: string; email?: string; photoURL?: string }) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProviderContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Handle auth state changes
  useEffect(() => {
    const handleAuthStateChange = async (firebaseUser: any) => {
      try {
        if (firebaseUser) {
          // Get fresh ID token
          const idToken = await firebaseUser.getIdToken(true)
          
          // Set session cookie
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          })

          if (!response.ok) {
            throw new Error('Failed to establish session')
          }

          // Update user state
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            profileImage: firebaseUser.photoURL,
            provider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
          })

          // Handle redirect after successful auth
          const callbackUrl = searchParams.get("callbackUrl")
          if (callbackUrl) {
            router.push(callbackUrl)
          }
        } else {
          setUser(null)
          // Clear session
          await fetch('/api/auth/session', { method: 'DELETE' })
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        toast.error('Authentication error occurred')
      } finally {
        setLoading(false)
      }
    }

    // Set session persistence and listen for auth changes
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        return onAuthStateChanged(auth, handleAuthStateChange)
      })
      .catch((error) => {
        console.error('Persistence error:', error)
        setLoading(false)
      })
  }, [router, searchParams])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await result.user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw new Error(error.message)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      if (name) {
        await updateFirebaseProfile(result.user, { displayName: name })
      }

      const idToken = await result.user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error.message)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
    } catch (error: any) {
      console.error('Google sign in error:', error)
      throw new Error(error.message)
    }
  }

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth)
      await fetch('/api/auth/session', { method: 'DELETE' })
      router.push('/welcome')
    } catch (error: any) {
      console.error('Sign out error:', error)
      throw new Error(error.message)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent')
    } catch (error: any) {
      console.error('Password reset error:', error)
      throw new Error(error.message)
    }
  }

  const updateProfile = async (data: { name?: string; email?: string; photoURL?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user')
    }

    try {
      const updates: any = {}
      
      if (data.name || data.photoURL) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: data.name || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL,
        })
      }

      if (data.email && data.email !== auth.currentUser.email) {
        await updateFirebaseEmail(auth.currentUser, data.email)
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        name: auth.currentUser?.displayName || prev.name,
        email: auth.currentUser?.email || prev.email,
        profileImage: auth.currentUser?.photoURL || prev.profileImage
      } : null)

      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Profile update error:', error)
      throw new Error(error.message)
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser?.email) {
      throw new Error('No authenticated user')
    }

    try {
      // Re-authenticate
      await signInWithEmailAndPassword(auth, auth.currentUser.email, currentPassword)
      await updateFirebasePassword(auth.currentUser, newPassword)
      toast.success('Password updated successfully')
    } catch (error: any) {
      console.error('Password update error:', error)
      throw new Error(error.message)
    }
  }

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
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </Suspense>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
