import { adminDb as db } from "@/lib/firebase-admin"
import { LawyerApplication } from "@/components/admin/lawyer-application"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { handleApprove, handleReject } from "./actions"

async function getLawyers() {
  const snapshot = await db.collection('lawyers').get()
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export default async function LawyerApplicationsPage() {
  const lawyers = await getLawyers()
  const pendingLawyers = lawyers.filter(lawyer => !lawyer.verified)
  const activeLawyers = lawyers.filter(lawyer => lawyer.verified && lawyer.active)
  const rejectedLawyers = lawyers.filter(lawyer => !lawyer.active && lawyer.verified)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lawyer Applications</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage lawyer applications
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingLawyers.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeLawyers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedLawyers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLawyers.length === 0 ? (
            <p>No pending applications</p>
          ) : (
            pendingLawyers.map(lawyer => (
              <LawyerApplication
                key={lawyer.id}
                lawyer={lawyer}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeLawyers.length === 0 ? (
            <p>No active lawyers</p>
          ) : (
            activeLawyers.map(lawyer => (
              <LawyerApplication
                key={lawyer.id}
                lawyer={lawyer}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedLawyers.length === 0 ? (
            <p>No rejected applications</p>
          ) : (
            rejectedLawyers.map(lawyer => (
              <LawyerApplication
                key={lawyer.id}
                lawyer={lawyer}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}