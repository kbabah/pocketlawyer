import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Calendar, MessageSquare, Star, UserCircle } from "lucide-react"

async function getLawyerProfile(userId: string) {
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

export default async function LawyerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('firebase-session')?.value
  
  if (!sessionCookie) {
    redirect('/sign-in')
  }

  const { auth } = await getFirebaseAdmin()
  
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    const lawyerProfile = await getLawyerProfile(decodedClaims.uid)
    
    if (!lawyerProfile) {
      redirect('/lawyers/register')
    }

    if (lawyerProfile.status !== 'accepted') {
      redirect('/lawyer/pending')
    }

    const sidebarItems = [
      {
        title: "Consultations",
        href: "/lawyer/dashboard",
        icon: MessageSquare
      },
      {
        title: "Availability",
        href: "/lawyer/dashboard/availability",
        icon: Calendar
      },
      {
        title: "Reviews",
        href: "/lawyer/dashboard/reviews",
        icon: Star
      },
      {
        title: "Profile",
        href: "/lawyer/dashboard/profile",
        icon: UserCircle
      }
    ]

    return (
      <div className="flex min-h-screen">
        <AppSidebar 
          items={sidebarItems}
          user={{
            name: lawyerProfile.name,
            image: lawyerProfile.photoURL,
            email: lawyerProfile.email
          }}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error verifying session:', error)
    redirect('/sign-in')
  }
}