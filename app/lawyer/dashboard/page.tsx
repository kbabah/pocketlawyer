"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Settings,
  Terminal,
  Activity,
  Zap,
  BarChart3,
  ChevronRight,
  LogOut
} from "lucide-react"
import { getLawyerByUserId, updateLawyerAvailability } from "@/lib/services/lawyer-service"
import { getLawyerBookings, confirmBooking, cancelBooking, completeBooking } from "@/lib/services/booking-service"
import type { Lawyer, Booking, LawyerAvailability } from "@/types/lawyer"
import { format } from "date-fns"

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export default function LawyerDashboardPage() {
  const { user, signOut } = useAuth()
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
      await cancelBooking(selectedBooking.id, 'lawyer', 'Cancelled by lawyer')
      toast.success(t("Booking cancelled"))
      setShowCancelDialog(false)
      loadDashboard()
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast.error(t("Failed to cancel booking"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await completeBooking(bookingId)
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
      toast.success(t("Availability updated successfully"))
      setShowAvailabilityDialog(false)
      loadDashboard()
    } catch (error: any) {
      console.error("Error updating availability:", error)
      toast.error(t("Failed to update availability"))
    } finally {
      setSavingAvailability(false)
    }
  }

  const toggleDayAvailability = (day: typeof DAYS[number]) => {
    if (!availability) return
    
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        available: !availability[day].available
      }
    })
  }

  const updateDayHours = (day: typeof DAYS[number], hours: string[]) => {
    if (!availability) return
    
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        hours
      }
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Terminal className="h-12 w-12 text-primary animate-pulse" />
            <p className="text-slate-400 font-mono">Initializing dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!lawyer || !user) {
    return null
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.date) >= new Date()
  )
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      case 'confirmed': return 'bg-primary/10 text-primary border-primary/30'
      case 'completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }
  }

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'in-person': return <Users className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl mb-6">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-white font-mono">LAWYER.CONTROL</h1>
                <p className="text-sm text-slate-400 font-mono">{lawyer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/lawyer/profile/edit")}
                className="text-primary hover:text-primary/80 font-mono"
              >
                <Settings className="h-4 w-4 mr-1" />
                EDIT PROFILE
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-slate-400 hover:text-white font-mono"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                CLIENT VIEW
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-red-400 hover:text-red-300 font-mono"
              >
                <LogOut className="h-4 w-4 mr-1" />
                EXIT
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label="PENDING"
            value={pendingBookings.length}
            color="text-yellow-400"
            bgColor="bg-yellow-500/10"
            borderColor="border-yellow-500/30"
          />
          <StatCard
            icon={<Zap className="h-5 w-5" />}
            label="UPCOMING"
            value={upcomingBookings.length}
            color="text-primary"
            bgColor="bg-primary/10"
            borderColor="border-primary/30"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="COMPLETED"
            value={completedBookings.length}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
            borderColor="border-blue-500/30"
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            label="EARNINGS"
            value={`${totalEarnings.toLocaleString()} XAF`}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
            borderColor="border-purple-500/30"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono"
            >
              <Terminal className="h-4 w-4 mr-2" />
              PENDING ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono"
            >
              <Calendar className="h-4 w-4 mr-2" />
              UPCOMING ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              HISTORY ({completedBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-mono"
            >
              <Settings className="h-4 w-4 mr-2" />
              CONFIG
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
              <EmptyState message="No pending bookings" />
            ) : (
              pendingBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onConfirm={() => {
                    setSelectedBooking(booking)
                    setShowConfirmDialog(true)
                  }}
                  onCancel={() => {
                    setSelectedBooking(booking)
                    setShowCancelDialog(true)
                  }}
                  getStatusColor={getStatusColor}
                  getBookingIcon={getBookingIcon}
                  t={t}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <EmptyState message="No upcoming bookings" />
            ) : (
              upcomingBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onComplete={() => handleCompleteBooking(booking.id)}
                  onCancel={() => {
                    setSelectedBooking(booking)
                    setShowCancelDialog(true)
                  }}
                  getStatusColor={getStatusColor}
                  getBookingIcon={getBookingIcon}
                  t={t}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.length === 0 ? (
              <EmptyState message="No completed bookings yet" />
            ) : (
              completedBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  getStatusColor={getStatusColor}
                  getBookingIcon={getBookingIcon}
                  t={t}
                  readonly
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">AVAILABILITY CONFIG</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">
                    Configure your weekly schedule
                  </p>
                </div>
                <Button
                  onClick={() => setShowAvailabilityDialog(true)}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  EDIT
                </Button>
              </div>
              
              <div className="space-y-3">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${lawyer.availability[day].available ? 'bg-primary' : 'bg-slate-600'}`} />
                      <span className="font-mono text-sm text-white uppercase">{day}</span>
                    </div>
                    <span className="text-sm font-mono text-slate-400">
                      {lawyer.availability[day].available 
                        ? `${lawyer.availability[day].hours.length} slots` 
                        : 'OFFLINE'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">PROFILE SETTINGS</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">
                    Manage your professional profile
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/lawyer/profile/edit")}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-mono"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  EDIT PROFILE
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <MetricItem label="RATING" value={`${lawyer.rating.toFixed(1)} ⭐`} />
                <MetricItem label="REVIEWS" value={lawyer.totalReviews} />
                <MetricItem label="HOURLY RATE" value={`${lawyer.hourlyRate} XAF`} />
                <MetricItem label="STATUS" value={lawyer.status.toUpperCase()} />
                <MetricItem label="SPECIALTIES" value={lawyer.specializations?.length || 0} />
                <MetricItem label="EXPERIENCE" value={`${lawyer.experience} years`} />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white font-mono mb-4">ACCOUNT</h3>
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20 font-mono"
              >
                <LogOut className="h-4 w-4 mr-2" />
                SIGN OUT
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary">CONFIRM BOOKING</DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              Approve this consultation request
            </DialogDescription>
          </DialogHeader>
          {selectedBooking?.type === 'video' && (
            <div className="space-y-2">
              <Label className="font-mono text-slate-300">Meeting Link</Label>
              <Input
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white font-mono"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowConfirmDialog(false)}
              className="font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={actionLoading || (selectedBooking?.type === 'video' && !meetingLink)}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CONFIRM'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="font-mono text-red-400">CANCEL BOOKING</DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCancelDialog(false)}
              className="font-mono"
            >
              ABORT
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={actionLoading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-mono"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CANCEL BOOKING'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary">EDIT AVAILABILITY</DialogTitle>
            <DialogDescription className="font-mono text-slate-400">
              Configure your weekly schedule
            </DialogDescription>
          </DialogHeader>
          
          {availability && (
            <div className="space-y-4">
              {DAYS.map(day => (
                <div key={day} className="border border-slate-800 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox
                      checked={availability[day].available}
                      onCheckedChange={() => toggleDayAvailability(day)}
                      className="border-slate-600"
                    />
                    <Label className="font-mono text-white uppercase cursor-pointer">
                      {day}
                    </Label>
                  </div>
                  
                  {availability[day].available && (
                    <div className="grid grid-cols-3 gap-2 ml-7">
                      {TIME_SLOTS.map(slot => (
                        <Button
                          key={slot}
                          size="sm"
                          variant={availability[day].hours.includes(slot) ? "default" : "outline"}
                          onClick={() => {
                            const currentHours = availability[day].hours
                            const newHours = currentHours.includes(slot)
                              ? currentHours.filter(h => h !== slot)
                              : [...currentHours, slot].sort()
                            updateDayHours(day, newHours)
                          }}
                          className={`font-mono text-xs ${
                            availability[day].hours.includes(slot)
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600'
                          }`}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowAvailabilityDialog(false)}
              className="font-mono"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSaveAvailability}
              disabled={savingAvailability}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono"
            >
              {savingAvailability ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SAVE'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

// Stat Card Component
function StatCard({ icon, label, value, color, bgColor, borderColor }: any) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`${color} font-mono text-xs font-bold`}>{label}</span>
        <div className={color}>{icon}</div>
      </div>
      <div className={`${color} text-2xl font-bold font-mono`}>
        {typeof value === 'number' ? value : value}
      </div>
    </div>
  )
}

// Booking Card Component
function BookingCard({ booking, onConfirm, onCancel, onComplete, getStatusColor, getBookingIcon, t, readonly }: any) {
  const bookingDate = booking.date instanceof Date ? booking.date : new Date(booking.date)
  const isPending = booking.status === 'pending'
  const isConfirmed = booking.status === 'confirmed'
  const isPast = bookingDate < new Date() && isConfirmed

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">{booking.userName}</h3>
              <p className="text-sm text-slate-400 font-mono">{booking.userEmail}</p>
              {booking.userPhone && (
                <p className="text-sm text-slate-400 font-mono">{booking.userPhone}</p>
              )}
            </div>
            <Badge className={`${getStatusColor(booking.status)} font-mono border`}>
              {booking.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(bookingDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Clock className="h-4 w-4 text-primary" />
              <span>{format(bookingDate, 'HH:mm')} · {booking.duration}m</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              {getBookingIcon(booking.type)}
              <span className="capitalize">{booking.type.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <DollarSign className="h-4 w-4 text-purple-400" />
              <span>{booking.totalAmount.toLocaleString()} XAF</span>
            </div>
          </div>

          {booking.notes && (
            <div className="text-sm bg-slate-800/50 rounded p-3 border border-slate-700">
              <p className="text-slate-400 font-mono italic">"{booking.notes}"</p>
            </div>
          )}

          {booking.meetingLink && (
            <div className="text-sm">
              <a 
                href={booking.meetingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-mono flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                {booking.meetingLink}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        {!readonly && (
          <div className="flex flex-col gap-2 min-w-[120px]">
            {isPending && (
              <>
                <Button
                  onClick={onConfirm}
                  size="sm"
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  CONFIRM
                </Button>
                <Button
                  onClick={onCancel}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-mono"
                >
                  <X className="h-4 w-4 mr-1" />
                  DECLINE
                </Button>
              </>
            )}
            {isConfirmed && !isPast && (
              <Button
                onClick={onCancel}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-mono"
              >
                <X className="h-4 w-4 mr-1" />
                CANCEL
              </Button>
            )}
            {isPast && onComplete && (
              <Button
                onClick={onComplete}
                size="sm"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-mono"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                COMPLETE
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-12 text-center">
      <Terminal className="h-12 w-12 text-slate-600 mx-auto mb-4" />
      <p className="text-slate-500 font-mono">{message}</p>
    </div>
  )
}

// Metric Item Component
function MetricItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <p className="text-xs text-slate-500 font-mono mb-1">{label}</p>
      <p className="text-lg font-bold text-white font-mono">{value}</p>
    </div>
  )
}
