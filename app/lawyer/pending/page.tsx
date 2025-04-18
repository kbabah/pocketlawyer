"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LawyerPendingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to sign-in if not logged in
      router.push('/sign-in')
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
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Application Received!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg">
              Thank you for registering as a lawyer on Pocket Lawyer. Your profile has been submitted for verification.
            </p>
            <p className="mt-4 text-muted-foreground">
              Our team will review your information to verify your credentials. This process typically takes 1-3 business days.
              We'll notify you via email once your profile has been approved.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Our team reviews your credentials and bar admission information</li>
              <li>We may contact you for additional verification if needed</li>
              <li>Once verified, your profile will be published on our platform</li>
              <li>You'll get access to the lawyer dashboard to manage your appointments</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild variant="outline">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/profile">
                Go to Your Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}