import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link' // Import Link
import { Button } from '@/components/ui/button' // Import Button

async function getStats() {
  const { adminDb: db } = await getFirebaseAdmin(); // Get initialized db instance
  const lawyersSnapshot = await db.collection('lawyers').get()
  const pendingLawyers = lawyersSnapshot.docs.filter(doc => !doc.data().verified).length
  const activeLawyers = lawyersSnapshot.docs.filter(doc => doc.data().verified && doc.data().active).length

  const usersSnapshot = await db.collection('users').get()
  const totalUsers = usersSnapshot.size

  return {
    pendingLawyers,
    activeLawyers,
    totalUsers,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"> {/* Add flex container */}
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Link href="/">
          <Button variant="outline">Return to Chat</Button> {/* Add Button */} 
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLawyers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lawyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLawyers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {stats.pendingLawyers > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You have {stats.pendingLawyers} lawyer {stats.pendingLawyers === 1 ? 'application' : 'applications'} pending review.</p>
            <a 
              href="/admin/lawyers" 
              className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Review Applications
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}