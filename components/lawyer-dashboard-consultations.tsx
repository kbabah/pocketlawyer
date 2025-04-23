"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, User, Video, MessageSquare, Phone } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface Consultation {
  id: string
  clientId: string
  clientName: string
  date: string
  timeSlot: {
    start: string
    end: string
  }
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  type: 'video' | 'audio' | 'chat' | 'inPerson'
  subject: string
  description?: string
}

const consultationTypeIcons = {
  video: Video,
  audio: Phone,
  chat: MessageSquare,
  inPerson: User,
}

export function LawyerDashboardConsultations({ lawyerId }: { lawyerId: string }) {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`/api/lawyers/${lawyerId}/consultations`)
      if (!response.ok) throw new Error('Failed to fetch consultations')

      const data = await response.json()
      setConsultations(data)
    } catch (error) {
      console.error('Error fetching consultations:', error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("lawyer.consultations.fetch.error")
      })
    } finally {
      setLoading(false)
    }
  }

  const updateConsultationStatus = async (consultationId: string, status: string) => {
    try {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update consultation')

      // Update local state
      setConsultations(prev =>
        prev.map(consultation =>
          consultation.id === consultationId
            ? { ...consultation, status }
            : consultation
        )
      )

      toast({
        title: t("lawyer.consultation.updated"),
        description: t("lawyer.consultation.update.success")
      })
    } catch (error) {
      console.error('Error updating consultation:', error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("lawyer.consultation.update.error")
      })
    }
  }

  const renderConsultationCard = (consultation: Consultation) => {
    const TypeIcon = consultationTypeIcons[consultation.type]
    const isUpcoming = new Date(consultation.date) > new Date()
    const formattedDate = new Date(consultation.date).toLocaleDateString()

    return (
      <Card key={consultation.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <TypeIcon className="h-4 w-4" />
                <span className="font-medium">{consultation.clientName}</span>
                <Badge variant={
                  consultation.status === 'confirmed' ? 'default' :
                  consultation.status === 'completed' ? 'secondary' :
                  consultation.status === 'cancelled' ? 'destructive' :
                  'outline'
                }>
                  {consultation.status}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formattedDate}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {consultation.timeSlot.start} - {consultation.timeSlot.end}
                </div>
                {consultation.description && (
                  <p className="mt-2">{consultation.description}</p>
                )}
              </div>
            </div>

            {isUpcoming && consultation.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateConsultationStatus(consultation.id, 'cancelled')}
                >
                  {t("lawyer.consultation.decline")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateConsultationStatus(consultation.id, 'confirmed')}
                >
                  {t("lawyer.consultation.accept")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="animate-pulse">Loading consultations...</div>
  }

  const upcomingConsultations = consultations.filter(
    c => new Date(c.date) > new Date() && c.status !== 'cancelled'
  )
  const pastConsultations = consultations.filter(
    c => new Date(c.date) <= new Date() || c.status === 'cancelled'
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("lawyer.consultations.title")}</CardTitle>
        <CardDescription>{t("lawyer.consultations.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">
              {t("lawyer.consultations.upcoming")} ({upcomingConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t("lawyer.consultations.past")} ({pastConsultations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingConsultations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {t("lawyer.consultations.no.upcoming")}
              </p>
            ) : (
              upcomingConsultations.map(renderConsultationCard)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastConsultations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {t("lawyer.consultations.no.past")}
              </p>
            ) : (
              pastConsultations.map(renderConsultationCard)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}