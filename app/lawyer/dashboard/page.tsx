"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { 
  Scale,
  Loader2, 
  Calendar, 
  Clock,
  Video,
  Phone,
  Users,
  CheckCircle,
  X,
  DollarSign,
  TrendingUp,
  Star,
  Settings
} from "lucide-react"
import { getLawyerByUserId, updateLawyerAvailability } from "@/lib/services/lawyer-service"
import { getLawyerBookings, confirmBooking, cancelBooking, completeBooking } from "@/lib/services/booking-service"
import type { Lawyer, Booking, LawyerAvailability } from "@/types/lawyer"
import { format } from "date-fns"

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export default function LawyerDashboardPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [meetingLink, setMeetingLink] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [availability, setAvailability] = useState<LawyerAvailability | null>(null)
  const [savingAvailability, setSavingAvailability] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
      return
    }
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const lawyerData = await getLawyerByUserId(user.id)
      
      if (!lawyerData) {
        toast.error(t("You are not registered as a lawyer"))
        router.push("/lawyers/register")
        return
      }

      if (lawyerData.status !== 'approved') {
        toast.error(t("Your lawyer registration is pending approval"))
        router.push("/")
        return
      }

      setLawyer(lawyerData)
      setAvailability(lawyerData.availability)
      
      const bookingsData = await getLawyerBookings(lawyerData.id)
      setBookings(bookingsData)
    } catch (error: any) {
      console.error("Error loading dashboard:", error)
      toast.error(t("Failed to load dashboard"))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return

    setActionLoading(true)
    try {
      await confirmBooking(
        selectedBooking.id,
        selectedBooking.type === 'video' ? meetingLink : undefined
      )
      toast.success(t("Booking confirmed!"))
      setShowConfirmDialog(false)
      setMeetingLink("")
      setSelectedBooking(null)
      loadDashboard()
    } catch (error: any) {
      console.error("Error confirming booking:", error)
      toast.error(t("Failed to confirm booking"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return

    setActionLoading(true)
    try {
      await cancelBooking(selectedBooking.id, 'lawyer', 'Lawyer cancelled the booking')
      toast.success(t("Booking cancelled"))
      setShowCancelDialog(false)
      setSelectedBooking(null)
      loadDashboard()
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast.error(t("Failed to cancel booking"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteBooking = async (booking: Booking) => {
    if (!confirm(t("Mark this consultation as completed?"))) return

    try {
      await completeBooking(booking.id)
      toast.success(t("Booking marked as completed"))
      loadDashboard()
    } catch (error: any) {
      console.error("Error completing booking:", error)
      toast.error(t("Failed to complete booking"))
    }
  }

  const handleSaveAvailability = async () => {
    if (!lawyer || !availability) return

    setSavingAvailability(true)
    try {
      await updateLawyerAvailability(lawyer.id, availability)
      toast.success(t("Availability updated successfully!"))
      setShowAvailabilityDialog(false)
      loadDashboard()
    } catch (error: any) {
      console.error("Error updating availability:", error)
      toast.error(t("Failed to update availability"))
    } finally {
      setSavingAvailability(false)
    }
  }

  const toggleDayAvailability = (day: keyof LawyerAvailability) => {
    if (!availability) return
    
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        available: !availability[day].available
      }
    })
  }

  const toggleTimeSlot = (day: keyof LawyerAvailability, time: string) => {
    if (!availability) return
    
    const dayData = availability[day]
    const hours = dayData.hours.includes(time)
      ? dayData.hours.filter(h => h !== time)
      : [...dayData.hours, time].sort()
    
    setAvailability({
      ...availability,
      [day]: {
        ...dayData,
        hours
      }
    })
  }

  const getBookingIcon = (type: Booking['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'in-person': return <Users className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: Booking['status']) => {
    const variants = {
      pending: 'default' as const,
      confirmed: 'default' as const,
      completed: 'secondary' as const,
      cancelled: 'destructive' as const,
    }
    
    const colors = {
      pending: 'text-yellow-600 dark:text-yellow-400',
      confirmed: 'text-green-600 dark:text-green-400',
      completed: 'text-blue-600 dark:text-blue-400',
      cancelled: 'text-red-600 dark:text-red-400',
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {t(status.charAt(0).toUpperCase() + status.slice(1))}
      </Badge>
    )
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.date) >= new Date()
  )
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0)

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const bookingDate = booking.date instanceof Date ? booking.date : new Date(booking.date)
    const isPending = booking.status === 'pending'
    const isConfirmed = booking.status === 'confirmed'
    const isPast = bookingDate < new Date() && isConfirmed

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">{booking.userName}</h3>
                  <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                  {booking.userPhone && (
                    <p className="text-sm text-muted-foreground">{booking.userPhone}</p>
                  )}
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(bookingDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(bookingDate, 'h:mm a')} ({booking.duration} {t("minutes")})</span>
                </div>
                <div className="flex items-center gap-2">
                  {getBookingIcon(booking.type)}
                  <span className="capitalize">{booking.type.replace('-', ' ')}</span>
                </div>
              </div>

              {booking.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium mb-1">{t("Client Notes")}:</p>
                  <p className="text-muted-foreground italic">{booking.notes}</p>
                </div>
              )}

              {booking.meetingLink && (
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium mb-1">{t("Meeting Link")}:</p>
                  <a 
                    href={booking.meetingLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {booking.meetingLink}
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 md:w-48">
              <div className="text-sm mb-2">
                <p className="text-muted-foreground">{t("Fee")}</p>
                <p className="text-xl font-bold">{booking.totalAmount.toLocaleString()} XAF</p>
              </div>

              {isPending && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowConfirmDialog(true)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("Confirm")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedBooking(booking)
                      setShowCancelDialog(true)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("Decline")}
                  </Button>
                </>
              )}

              {isPast && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleCompleteBooking(booking)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("Mark Complete")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!lawyer) {
    return null
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("Lawyer Dashboard")}</h1>
              <p className="text-muted-foreground">
                {t("Welcome back")}, {lawyer.name}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{pendingBookings.length}</div>
                  <p className="text-xs text-muted-foreground">{t("Pending")}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                  <p className="text-xs text-muted-foreground">{t("Upcoming")}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{completedBookings.length}</div>
                  <p className="text-xs text-muted-foreground">{t("Completed")}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{totalEarnings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{t("Total Earnings (XAF)")}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setShowAvailabilityDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                {t("Manage Availability")}
              </Button>
              <Button variant="outline" onClick={() => router.push(`/lawyers/${lawyer.id}`)}>
                {t("View My Profile")}
              </Button>
              <Button variant="outline" onClick={() => router.push("/lawyer/profile")}>
                {t("Edit Profile")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              {t("Pending")} ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              {t("Upcoming")} ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t("Completed")} ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t("No pending bookings")}</p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t("No upcoming consultations")}</p>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t("No completed consultations yet")}</p>
                </CardContent>
              </Card>
            ) : (
              completedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Confirm Booking")}</DialogTitle>
              <DialogDescription>
                {t("Confirm this consultation with")} {selectedBooking?.userName}
              </DialogDescription>
            </DialogHeader>

            {selectedBooking?.type === 'video' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meetingLink">{t("Video Meeting Link")} (optional)</Label>
                  <Input
                    id="meetingLink"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Provide a Google Meet, Zoom, or other video call link")}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false)
                  setMeetingLink("")
                }}
                disabled={actionLoading}
              >
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("Confirming...")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("Confirm Booking")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Decline Booking")}</DialogTitle>
              <DialogDescription>
                {t("Are you sure you want to decline this booking?")}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={actionLoading}
              >
                {t("Keep Booking")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("Declining...")}
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    {t("Decline Booking")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Availability Dialog */}
        <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Manage Availability")}</DialogTitle>
              <DialogDescription>
                {t("Set your working hours for each day of the week")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {availability && DAYS.map((day) => (
                <div key={day} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={availability[day].available}
                      onCheckedChange={() => toggleDayAvailability(day)}
                    />
                    <Label className="text-base font-medium capitalize cursor-pointer">
                      {t(day)}
                    </Label>
                  </div>

                  {availability[day].available && (
                    <div className="ml-6 grid grid-cols-3 md:grid-cols-5 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant={availability[day].hours.includes(time) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTimeSlot(day, time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAvailabilityDialog(false)}
                disabled={savingAvailability}
              >
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleSaveAvailability}
                disabled={savingAvailability}
              >
                {savingAvailability ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("Saving...")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("Save Availability")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
