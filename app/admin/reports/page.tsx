import { adminDb as db } from "@/lib/firebase-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, subDays } from "date-fns"

async function getReportData() {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  
  // Get all lawyers
  const lawyersSnapshot = await db.collection('lawyers').get()
  const totalLawyers = lawyersSnapshot.size
  const verifiedLawyers = lawyersSnapshot.docs.filter(doc => doc.data().verified).length
  
  // Get recent consultations
  const consultationsSnapshot = await db.collection('consultations')
    .where('createdAt', '>=', thirtyDaysAgo.toISOString())
    .get()
  
  const consultations = consultationsSnapshot.docs.map(doc => doc.data())
  const totalConsultations = consultations.length
  const completedConsultations = consultations.filter(c => c.status === 'completed').length
  
  // Calculate average rating
  const ratingsSum = consultations.reduce((sum, c) => sum + (c.rating || 0), 0)
  const averageRating = totalConsultations > 0 ? (ratingsSum / totalConsultations).toFixed(1) : 'N/A'
  
  return {
    totalLawyers,
    verifiedLawyers,
    totalConsultations,
    completedConsultations,
    averageRating,
    monthLabel: format(thirtyDaysAgo, 'MMMM d')
  }
}

export default async function ReportsPage() {
  const stats = await getReportData()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Performance metrics and platform statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lawyer Verification Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.verifiedLawyers / stats.totalLawyers) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedLawyers} out of {stats.totalLawyers} lawyers verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              30-Day Consultation Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.completedConsultations / stats.totalConsultations) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedConsultations} completed of {stats.totalConsultations} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Consultation Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {stats.completedConsultations} completed consultations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Since {stats.monthLabel}:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>Total consultations scheduled: {stats.totalConsultations}</li>
            <li>Completion rate: {((stats.completedConsultations / stats.totalConsultations) * 100).toFixed(1)}%</li>
            <li>New lawyer applications: {stats.totalLawyers - stats.verifiedLawyers}</li>
            <li>Average consultation rating: {stats.averageRating}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}