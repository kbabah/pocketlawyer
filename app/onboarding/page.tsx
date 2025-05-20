"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PostRegistrationOnboarding } from "@/components/post-registration-onboarding"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [pageLoaded, setPageLoaded] = useState(false)

  useEffect(() => {
    // Wait for auth state to be determined
    if (!authLoading) {
      if (!user) {
        router.push("/sign-in")
        return
      }
      setPageLoaded(true)
    }
  }, [user, authLoading, router])

  // Show loading state while checking auth
  if (authLoading || !pageLoaded) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-pattern-light dark:bg-pattern-dark">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    )
  }

  // Only render onboarding component if user is authenticated
  if (!user) {
    return null
  }

  return <PostRegistrationOnboarding />
}