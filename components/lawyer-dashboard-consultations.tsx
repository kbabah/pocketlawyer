"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { CalendarIcon, Clock, MessageSquare, Video, Phone, User, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { toast } from 'sonner'

// Define consultation types
interface Consultation {
  id: string
  clientId: string
  clientName: string
  clientPhoto?: string
  date: string
  time: string
  type: 'video' | 'audio' | 'chat' | 'inPerson'
  status: 'upcoming' | 'completed' | 'cancelled'
  notes?: string
  additionalInfo?: string
}

export default function LawyerDashboardConsultations() {
  const { t } = useLanguage()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [consultationNotes, setConsultationNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Fetch consultations
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        // In a real app, this would call your API
        // Mock data for demonstration
        const mockConsultations: Consultation[] = [
          {
            id: '1',
            clientId: 'client-1',
            clientName: 'John Doe',
            date: '2025-04-20',
            time: '10:00',
            type: 'video',
            status: 'upcoming'
          },
          {
            id: '2',
            clientId: 'client-2',
            clientName: 'Marie Nguyen',
            date: '2025-04-18',
            time: '14:30',
            type: 'inPerson',
            status: 'upcoming',
            additionalInfo: 'First consultation about divorce proceedings.'
          },
          {
            id: '3',
            clientId: 'client-3',
            clientName: 'Ibrahim Sako',
            date: '2025-04-15',
            time: '11:00',
            type: 'video',
            status: 'completed',
            notes: 'Client wants to proceed with business registration. Need to prepare documentation.'
          },
          {
            id: '4',
            clientId: 'client-4',
            clientName: 'Claire Takam',
            date: '2025-04-10',
            time: '09:15',
            type: 'audio',
            status: 'cancelled'
          }
        ]
        
        setConsultations(mockConsultations)
      } catch (error) {
        console.error('Failed to load consultations:', error)
        toast.error(t('lawyer.consultations.error'))
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [t])

  const handleShowDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setDetailsOpen(true)
    
    // If there are existing notes, pre-fill them
    if (consultation.notes) {
      setConsultationNotes(consultation.notes)
    } else {
      setConsultationNotes('')
    }
  }

  const handleOpenCancelDialog = (consultation: Consultation) => {
    setSelectedConsultation(consultation)
    setCancellationReason('')
    setCancelDialogOpen(true)
  }

  const handleOpenNotesDialog = () => {
    if (!selectedConsultation) return
    setNotesDialogOpen(true)
  }

  const handleCancelConsultation = async () => {
    if (!selectedConsultation) return
    
    setCancelLoading(true)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/consultations/${selectedConsultation.id}/cancel`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ reason: cancellationReason })
      // })
      
      // Mock the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the consultation status locally
      setConsultations(prevConsultations => 
        prevConsultations.map(c => 
          c.id === selectedConsultation.id ? { ...c, status: 'cancelled' } : c
        )
      )
      
      setCancelDialogOpen(false)
      toast.success(t('lawyer.consultation.cancelled'))
    } catch (error) {
      console.error('Failed to cancel consultation:', error)
      toast.error(t('lawyer.consultation.cancel.error'))
    } finally {
      setCancelLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedConsultation) return
    
    setSavingNotes(true)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/consultations/${selectedConsultation.id}/notes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ notes: consultationNotes })
      // })
      
      // Mock the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the consultation notes locally
      setConsultations(prevConsultations => 
        prevConsultations.map(c => 
          c.id === selectedConsultation.id ? { ...c, notes: consultationNotes } : c
        )
      )
      
      // Also update the selected consultation
      setSelectedConsultation({
        ...selectedConsultation,
        notes: consultationNotes
      })
      
      setNotesDialogOpen(false)
      toast.success(t('lawyer.consultation.notes.saved'))
    } catch (error) {
      console.error('Failed to save notes:', error)
      toast.error(t('lawyer.consultation.notes.error'))
    } finally {
      setSavingNotes(false)
    }
  }

  // Filter consultations based on their status
  const upcomingConsultations = consultations.filter(c => c.status === 'upcoming')
  const completedConsultations = consultations.filter(c => c.status === 'completed')
  const cancelledConsultations = consultations.filter(c => c.status === 'cancelled')

  // Filter consultations for the calendar view
  const consultationsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    return consultations.filter(c => c.date === dateString)
  }

  // Get the appropriate icon for the consultation type
  const getConsultationTypeIcon = (type: Consultation['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Phone className="h-4 w-4" />
      case 'chat':
        return <MessageSquare className="h-4 w-4" />
      case 'inPerson':
        return <User className="h-4 w-4" />
    }
  }

  // Get the appropriate color for the consultation status
  const getStatusBadgeVariant = (status: Consultation['status']) => {
    switch (status) {
      case 'upcoming':
        return 'default'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'destructive'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">{t('lawyer.consultations.list.view')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('lawyer.consultations.calendar.view')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Tabs defaultValue="upcoming" className="mt-4">
            <TabsList>
              <TabsTrigger value="upcoming">
                {t('lawyer.consultations.upcoming')}
                {upcomingConsultations.length > 0 && (
                  <Badge className="ml-2">{upcomingConsultations.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t('lawyer.consultations.completed')}
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                {t('lawyer.consultations.cancelled')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-4">
              <div className="grid gap-4">
                {upcomingConsultations.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      {t('lawyer.consultations.no.upcoming')}
                    </CardContent>
                  </Card>
                ) : (
                  upcomingConsultations.map((consultation) => (
                    <Card key={consultation.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row justify-between items-start p-6">
                          <div className="flex items-start gap-4 mb-4 md:mb-0">
                            <Avatar>
                              <AvatarImage 
                                src={consultation.clientPhoto} 
                                alt={consultation.clientName} 
                              />
                              <AvatarFallback>
                                {consultation.clientName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{consultation.clientName}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                {getConsultationTypeIcon(consultation.type)}
                                {t(`consultation.type.${consultation.type}`)}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {consultation.date}
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {consultation.time}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleShowDetails(consultation)}>
                              {t('lawyer.consultation.details')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleOpenCancelDialog(consultation)}
                            >
                              {t('lawyer.consultation.cancel')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <div className="grid gap-4">
                {completedConsultations.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      {t('lawyer.consultations.no.completed')}
                    </CardContent>
                  </Card>
                ) : (
                  completedConsultations.map((consultation) => (
                    <Card key={consultation.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start">
                          <div className="flex items-start gap-4 mb-4 md:mb-0">
                            <Avatar>
                              <AvatarImage 
                                src={consultation.clientPhoto} 
                                alt={consultation.clientName} 
                              />
                              <AvatarFallback>
                                {consultation.clientName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{consultation.clientName}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                {getConsultationTypeIcon(consultation.type)}
                                {t(`consultation.type.${consultation.type}`)}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {consultation.date}
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {consultation.time}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleShowDetails(consultation)}>
                            {t('lawyer.consultation.details')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-4">
              <div className="grid gap-4">
                {cancelledConsultations.length === 0 ? (
                  <Card>
                    <CardContent className="py-6 text-center text-muted-foreground">
                      {t('lawyer.consultations.no.cancelled')}
                    </CardContent>
                  </Card>
                ) : (
                  cancelledConsultations.map((consultation) => (
                    <Card key={consultation.id} className="border-destructive/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start">
                          <div className="flex items-start gap-4 mb-4 md:mb-0">
                            <Avatar>
                              <AvatarImage 
                                src={consultation.clientPhoto} 
                                alt={consultation.clientName} 
                              />
                              <AvatarFallback>
                                {consultation.clientName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{consultation.clientName}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                {getConsultationTypeIcon(consultation.type)}
                                {t(`consultation.type.${consultation.type}`)}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {consultation.date}
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {consultation.time}
                                </p>
                              </div>
                              <Badge className="mt-2" variant="destructive">
                                {t('lawyer.consultation.cancelled')}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleShowDetails(consultation)}>
                            {t('lawyer.consultation.details')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('lawyer.consultations.calendar')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                // This will highlight days that have consultations
                modifiers={{
                  consultation: (date) => consultationsForDate(date).length > 0,
                }}
                modifiersStyles={{
                  consultation: { borderBottom: '2px solid var(--primary)' }
                }}
              />
              
              {selectedDate && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">
                    {format(selectedDate, 'PPP')}
                  </h3>
                  
                  <div className="grid gap-2">
                    {consultationsForDate(selectedDate).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('lawyer.consultations.no.consultations.for.date')}
                      </p>
                    ) : (
                      consultationsForDate(selectedDate).map((consultation) => (
                        <Card key={consultation.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-medium">{consultation.clientName}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {consultation.time}
                                </p>
                                <Badge variant={getStatusBadgeVariant(consultation.status)}>
                                  {t(`lawyer.consultation.status.${consultation.status}`)}
                                </Badge>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleShowDetails(consultation)}
                              >
                                {t('lawyer.consultation.details')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Consultation Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedConsultation && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('lawyer.consultation.details')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={selectedConsultation.clientPhoto} 
                    alt={selectedConsultation.clientName} 
                  />
                  <AvatarFallback>
                    {selectedConsultation.clientName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedConsultation.clientName}</h3>
                  <Badge variant={getStatusBadgeVariant(selectedConsultation.status)}>
                    {t(`lawyer.consultation.status.${selectedConsultation.status}`)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('consultation.date')}</h4>
                  <p className="text-sm">{selectedConsultation.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('consultation.time')}</h4>
                  <p className="text-sm">{selectedConsultation.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">{t('consultation.type')}</h4>
                  <p className="text-sm flex items-center gap-1">
                    {getConsultationTypeIcon(selectedConsultation.type)}
                    {t(`consultation.type.${selectedConsultation.type}`)}
                  </p>
                </div>
              </div>
              
              {selectedConsultation.additionalInfo && (
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    {t('consultation.additional.info')}
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedConsultation.additionalInfo}
                  </p>
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">{t('lawyer.consultation.notes')}</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleOpenNotesDialog}
                    disabled={selectedConsultation.status === 'cancelled'}
                  >
                    {t('lawyer.consultation.edit.notes')}
                  </Button>
                </div>
                {selectedConsultation.notes ? (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {selectedConsultation.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('lawyer.consultation.no.notes')}
                  </p>
                )}
              </div>
              
              <DialogFooter>
                {selectedConsultation.status === 'upcoming' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDetailsOpen(false)
                      handleOpenCancelDialog(selectedConsultation)
                    }}
                  >
                    {t('lawyer.consultation.cancel')}
                  </Button>
                )}
                <Button onClick={() => setDetailsOpen(false)}>
                  {t('close')}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Cancel Consultation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        {selectedConsultation && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('lawyer.consultation.cancel')}</DialogTitle>
              <DialogDescription>
                {t('lawyer.consultation.cancel.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">{t('lawyer.consultation.with')}</h4>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage 
                      src={selectedConsultation.clientPhoto} 
                      alt={selectedConsultation.clientName} 
                    />
                    <AvatarFallback>
                      {selectedConsultation.clientName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p>{selectedConsultation.clientName}</p>
                </div>
                <p className="mt-1 text-sm">
                  {selectedConsultation.date} at {selectedConsultation.time}
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cancellationReason" className="text-sm font-medium">
                  {t('lawyer.consultation.cancel.reason')}
                </label>
                <Textarea
                  id="cancellationReason"
                  placeholder={t('lawyer.consultation.cancel.reason.placeholder')}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setCancelDialogOpen(false)}
                >
                  {t('back')}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelConsultation}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('lawyer.consultation.cancelling')}
                    </>
                  ) : (
                    t('lawyer.consultation.confirm.cancel')
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        {selectedConsultation && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('lawyer.consultation.edit.notes')}</DialogTitle>
              <DialogDescription>
                {t('lawyer.consultation.notes.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder={t('lawyer.consultation.notes.placeholder')}
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                rows={6}
              />
              
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setNotesDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}