import { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LawyerDashboardAvailability } from "@/components/lawyer-dashboard-availability"
import { LawyerDashboardConsultations } from "@/components/lawyer-dashboard-consultations"
import { LawyerDashboardReviews } from "@/components/lawyer-dashboard-reviews"
import { LawyerDashboardProfile } from "@/components/lawyer-dashboard-profile"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Lawyer Dashboard",
  description: "Manage your consultations, availability, and reviews"
}

// Removed redundant getLawyerProfile function, handled in layout

export default async function LawyerDashboardPage() {
  // Authentication and initial profile checks are handled by the layout
  // We can assume the user is an authenticated and accepted lawyer here
  
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('firebase-session')?.value
  
  // Still need to get UID for child components, but redirect checks are removed
  if (!sessionCookie) {
    // This case should theoretically not be reached due to layout checks
    redirect('/sign-in') 
  }

  const { auth, adminDb } = await getFirebaseAdmin()
  let decodedClaims
  let lawyerProfileData

  try {
    decodedClaims = await auth.verifySessionCookie(sessionCookie)
    // Fetch profile data needed for child components
    const lawyerDoc = await adminDb.collection('lawyers').doc(decodedClaims.uid).get()
    if (!lawyerDoc.exists) {
       // This case should also not be reached due to layout checks
      redirect('/lawyers/register')
    }
    lawyerProfileData = { id: lawyerDoc.id, ...lawyerDoc.data() }
    // No need to check status !== 'accepted' here, layout handles it

  } catch (error) {
    console.error('Error verifying session or fetching profile in page:', error)
    // Redirect handled by layout, but log error if something unexpected happens
    redirect('/sign-in')
  }

  // Ensure decodedClaims and lawyerProfileData are available
  if (!decodedClaims || !lawyerProfileData) {
     console.error('Missing claims or profile data despite layout checks.')
     redirect('/sign-in')
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your consultations, availability, and client reviews
          </p>
        </div>

        <Tabs defaultValue="consultations" className="space-y-8">
          <TabsList>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="space-y-4">
            <LawyerDashboardConsultations lawyerId={decodedClaims.uid} />
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            {/* Pass the fetched profile data */} 
            <LawyerDashboardAvailability lawyerProfile={lawyerProfileData} /> 
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <LawyerDashboardReviews lawyerId={decodedClaims.uid} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
             {/* Pass the fetched profile data */} 
            <LawyerDashboardProfile lawyerProfile={lawyerProfileData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}