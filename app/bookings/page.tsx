"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
  Calendar, 
  Loader2, 
  Clock, 
  MapPin,
  Video,
  Phone,
  Users,
  ExternalLink,
  X,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { getUserBookings, cancelBooking, createReview, getBookingReview } from "@/lib/services/booking-service"
import type { Booking } from "@/types/lawyer"
import { format } from "date-fns"

export default function UserBookingsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [existingReviews, setExistingReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user || user.isAnonymous) {
      router.push("/sign-in?redirect=/bookings")
      return
    }
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    if (!user || user.isAnonymous) return
    
    try {
      setLoading(true)
      const data = await getUserBookings(user.id)
      setBookings(data)
      
      // Check which bookings have reviews
      const reviewedBookingIds = new Set<string>()
      for (const booking of data) {
        if (booking.status === 'completed') {
          const review = await getBookingReview(booking.id)
          if (review) {
            reviewedBookingIds.add(booking.id)
          }
        }
      }
      setExistingReviews(reviewedBookingIds)
    } catch (error: any) {
      console.error("Error loading bookings:", error)
      toast.error(t("Failed to load bookings"))
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!user || user.isAnonymous) {
      toast.error(t("Please sign in to cancel bookings"))
      return
    }

    if (!selectedBooking || !cancelReason.trim()) {
      toast.error(t("Please provide a cancellation reason"))
      return
    }

    setCancelling(true)
    try {
      await cancelBooking(selectedBooking.id, 'user', cancelReason)
      toast.success(t("Booking cancelled successfully"))
      setShowCancelDialog(false)
      setCancelReason("")
      setSelectedBooking(null)
      loadBookings()
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast.error(t("Failed to cancel booking"))
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedBooking || !user || user.isAnonymous) {
      toast.error(t("Please sign in to submit reviews"))
      return
    }

    if (!reviewComment.trim()) {
      toast.error(t("Please write a review comment"))
      return
    }

    setSubmittingReview(true)
    try {
      await createReview({
        bookingId: selectedBooking.id,
        userId: user.id,
        userName: user.name || user.email || 'Anonymous',
        lawyerId: selectedBooking.lawyerId,
        rating: reviewRating,
        comment: reviewComment,
      })
      
      toast.success(t("Review submitted successfully!"))
      setShowReviewDialog(false)
      setReviewRating(5)
      setReviewComment("")
      setSelectedBooking(null)
      setExistingReviews(prev => new Set(prev).add(selectedBooking.id))
    } catch (error: any) {
      console.error("Error submitting review:", error)
      toast.error(t("Failed to submit review"))
    } finally {
      setSubmittingReview(false)
    }
  }

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowCancelDialog(true)
  }

  const openReviewDialog = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowReviewDialog(true)
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
        {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
        {status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
        {status === 'cancelled' && <X className="h-3 w-3 mr-1" />}
        {t(status.charAt(0).toUpperCase() + status.slice(1))}
      </Badge>
    )
  }

  const upcomingBookings = bookings.filter(b => 
    (b.status === 'pending' || b.status === 'confirmed') && 
    new Date(b.date) >= new Date()
  )

  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || 
    b.status === 'cancelled' ||
    (new Date(b.date) < new Date() && b.status !== 'pending')
  )

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const bookingDate = booking.date instanceof Date ? booking.date : new Date(booking.date)
    const isPast = bookingDate < new Date()
    const canCancel = !isPast && (booking.status === 'pending' || booking.status === 'confirmed')
    const canReview = booking.status === 'completed' && !existingReviews.has(booking.id)

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left: Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 
                    className="text-lg font-bold mb-1 cursor-pointer hover:text-primary"
                    onClick={() => router.push(`/lawyers/${booking.lawyerId}`)}
                  >
                    {booking.lawyerName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getBookingIcon(booking.type)}
                    <span className="capitalize">{booking.type.replace('-', ' ')}</span>
                  </div>
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
              </div>

              {booking.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium mb-1">{t("Notes")}:</p>
                  <p className="text-muted-foreground italic">{booking.notes}</p>
                </div>
              )}

              {booking.meetingLink && booking.status === 'confirmed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(booking.meetingLink, '_blank')}
                  className="w-full md:w-auto"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("Join Video Call")}
                </Button>
              )}

              {booking.status === 'cancelled' && booking.cancellationReason && (
                <div className="text-sm p-3 bg-destructive/10 rounded-md">
                  <p className="font-medium text-destructive mb-1">
                    {t("Cancellation Reason")}:
                  </p>
                  <p className="text-muted-foreground">{booking.cancellationReason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Cancelled by")}: {booking.cancelledBy}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col gap-2 md:w-48">
              <div className="text-sm">
                <p className="text-muted-foreground">{t("Total")}</p>
                <p className="text-xl font-bold">{booking.totalAmount.toLocaleString()} XAF</p>
                <p className="text-xs text-muted-foreground">
                  {t("Payment")}: {booking.paymentStatus}
                </p>
              </div>

              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openCancelDialog(booking)}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("Cancel Booking")}
                </Button>
              )}

              {canReview && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openReviewDialog(booking)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {t("Leave Review")}
                </Button>
              )}

              {existingReviews.has(booking.id) && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {t("Review submitted")}
                </div>
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

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("My Bookings")}</h1>
          <p className="text-muted-foreground">
            {t("Manage your legal consultations")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              <p className="text-xs text-muted-foreground">{t("Upcoming Consultations")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{pastBookings.length}</div>
              <p className="text-xs text-muted-foreground">{t("Past Consultations")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">{t("Total Bookings")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              {t("Upcoming")} ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t("Past")} ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {t("No upcoming consultations")}
                  </p>
                  <Button onClick={() => router.push("/lawyers")}>
                    {t("Browse Lawyers")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {t("No past consultations")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Cancel Booking")}</DialogTitle>
              <DialogDescription>
                {t("Please provide a reason for cancelling this consultation")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">{t("Cancellation Reason")} *</Label>
                <Textarea
                  id="reason"
                  placeholder={t("e.g., Schedule conflict, found another lawyer...")}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false)
                  setCancelReason("")
                }}
                disabled={cancelling}
              >
                {t("Keep Booking")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={cancelling || !cancelReason.trim()}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("Cancelling...")}
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    {t("Cancel Booking")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Leave a Review")}</DialogTitle>
              <DialogDescription>
                {t("Share your experience with")} {selectedBooking?.lawyerName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>{t("Rating")} *</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          star <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="comment">{t("Your Review")} *</Label>
                <Textarea
                  id="comment"
                  placeholder={t("Share your thoughts about the consultation...")}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewDialog(false)
                  setReviewRating(5)
                  setReviewComment("")
                }}
                disabled={submittingReview}
              >
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewComment.trim()}
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("Submitting...")}
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    {t("Submit Review")}
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
