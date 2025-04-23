import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Application Status",
  description: "Check your lawyer application status"
}

async function getLawyerStatus(userId: string) {
  const { adminDb } = await getFirebaseAdmin()
  const lawyerDoc = await adminDb.collection('lawyers').doc(userId).get()
  
  if (!lawyerDoc.exists) {
    return null
  }
  
  return {
    id: lawyerDoc.id,
    ...lawyerDoc.data()
  }
}

export default async function PendingPage() {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('firebase-session')?.value
  
  if (!sessionCookie) {
    redirect('/sign-in')
  }

  const { auth } = await getFirebaseAdmin()
  
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    const lawyerProfile = await getLawyerStatus(decodedClaims.uid)
    
    if (!lawyerProfile) {
      redirect('/lawyers/register')
    }

    if (lawyerProfile.status === 'accepted') {
      redirect('/lawyer/dashboard')
    }

    const statusConfig = {
      pending: {
        icon: Clock,
        color: "bg-yellow-500",
        text: "Your application is currently under review. We'll notify you once a decision has been made.",
        description: "This usually takes 1-3 business days."
      },
      rejected: {
        icon: XCircle,
        color: "bg-red-500",
        text: "Unfortunately, your application has been rejected.",
        description: lawyerProfile.rejectionReason || "Please contact support for more information."
      }
    }

    const status = lawyerProfile.status as keyof typeof statusConfig
    const StatusIcon = statusConfig[status].icon

    return (
      <div className="container max-w-2xl py-20">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Application Status</CardTitle>
              <Badge variant={status === 'pending' ? 'secondary' : 'destructive'}>
                {status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Submitted on {new Date(lawyerProfile.submittedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
              <StatusIcon className={`h-12 w-12 text-${status === 'pending' ? 'yellow' : 'red'}-500`} />
              <div>
                <p className="font-medium mb-1">{statusConfig[status].text}</p>
                <p className="text-sm text-muted-foreground">
                  {statusConfig[status].description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Submitted Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium">{lawyerProfile.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{lawyerProfile.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">License Number</span>
                  <span className="font-medium">{lawyerProfile.licenseNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Specializations</span>
                  <span className="font-medium">
                    {lawyerProfile.specializations?.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 pt-4">
              {status === 'rejected' ? (
                <>
                  <Button asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Return Home</Link>
                  </Button>
                </>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error verifying session:', error)
    redirect('/sign-in')
  }
}