"use client"

import React from 'react'
import { LawyerRegistrationForm } from '@/components/lawyer-registration-form'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LawyerRegistrationPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to sign-in if not logged in
      router.replace('/sign-in?callbackUrl=/lawyers/register')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/lawyers" className="text-primary hover:underline">
          ← Back to Directory
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Legal Professional Registration</h1>
        <p className="text-muted-foreground">
          Complete the form below to join our platform as a legal professional.
          Your profile will undergo verification before being published.
        </p>
      </div>
      
      <LawyerRegistrationForm />
    </div>
  )
}