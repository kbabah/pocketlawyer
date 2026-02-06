"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  ArrowLeft,
  Clock,
  Video,
  Phone,
  Users,
  CheckCircle
} from "lucide-react"
import { getLawyer } from "@/lib/services/lawyer-service"
import { createBooking, isTimeSlotAvailable } from "@/lib/services/booking-service"
import type { Lawyer } from "@/types/lawyer"
import { DURATION_OPTIONS, CONSULTATION_TYPES } from "@/types/lawyer"

export default function BookLawyerPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const lawyerId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [duration, setDuration] = useState(60)
  const [consultationType, setConsultationType] = useState<'video' | 'phone' | 'in-person'>('video')
  const [notes, setNotes] = useState("")
  const [userPhone, setUserPhone] = useState("")

  useEffect(() => {
    if (!user) {
      toast.error(t("Please sign in to book a consultation"))
      router.push("/sign-in")
      return
    }
    
    if (lawyerId) {
      loadLawyer()
    }
  }, [lawyerId, user])

  const loadLawyer = async () => {
    try {
      setLoading(true)
      const data = await getLawyer(lawyerId)
      if (!data) {
        toast.error(t("Lawyer not found"))
        router.push("/lawyers")
        return
      }
      setLawyer(data)
    } catch (error: any) {
      console.error("Error loading lawyer:", error)
      toast.error(t("Failed to load lawyer"))
    } finally {
      setLoading(false)
    }
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !lawyer) return []

    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof lawyer.availability
    const dayAvailability = lawyer.availability[dayName]

    if (!dayAvailability?.available) {
      return []
    }

    // Return predefined hours or generate slots from 9am to 5pm
    const defaultSlots = [
      "09:00", "10:00", "11:00", "12:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00"
    ]

    return dayAvailability.hours.length > 0 ? dayAvailability.hours : defaultSlots
  }

  const calculateTotal = () => {
    if (!lawyer) return 0
    const hours = duration / 60
    return Math.round(lawyer.hourlyRate * hours)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !lawyer) return

    // Validation
    if (!selectedDate) {
      toast.error(t("Please select a date"))
      return
    }

    if (!selectedTime) {
      toast.error(t("Please select a time"))
      return
    }

    if (consultationType === 'phone' && !userPhone) {
      toast.error(t("Please provide your phone number"))
      return
    }

    // Create date object
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const consultationDate = new Date(selectedDate)
    consultationDate.setHours(hours, minutes, 0, 0)

    // Check if date is in the past
    if (consultationDate < new Date()) {
      toast.error(t("Please select a future date and time"))
      return
    }

    // Check availability
    setSubmitting(true)
    try {
      const available = await isTimeSlotAvailable(lawyerId, consultationDate, duration)
      
      if (!available) {
        toast.error(t("This time slot is no longer available. Please choose another time."))
        setSubmitting(false)
        return
      }

      // Create booking
      const bookingData: any = {
        userId: user.id,
        userName: user.name || user.email,
        userEmail: user.email,
        lawyerId: lawyer.id,
        lawyerName: lawyer.name,
        lawyerEmail: lawyer.email,
        date: consultationDate,
        duration,
        type: consultationType,
        status: 'pending',
        totalAmount: calculateTotal(),
        paymentStatus: 'pending',
      }

      // Only add optional fields if they have values
      if (consultationType === 'phone' && userPhone) {
        bookingData.userPhone = userPhone
      }
      if (notes) {
        bookingData.notes = notes
      }

      await createBooking(bookingData)

      setSubmitted(true)
      toast.success(t("Booking request submitted successfully!"))
    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast.error(t("Failed to create booking"))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!lawyer || !user) {
    return null
  }

  if (submitted) {
    return (
      <MainLayout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("Booking Submitted!")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("Your consultation request has been sent to")} <strong>{lawyer.name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                {t("You will receive an email confirmation once the lawyer confirms your booking.")}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/bookings")}>
                  {t("View My Bookings")}
                </Button>
                <Button onClick={() => router.push("/lawyers")}>
                  {t("Browse More Lawyers")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const availableSlots = getAvailableTimeSlots()

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back")}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("Book Consultation")}</h1>
          <p className="text-muted-foreground">
            {t("with")} <strong>{lawyer.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {t("Select Date")}
                  </CardTitle>
                  <CardDescription>
                    {t("Choose your preferred consultation date")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border w-full"
                  />
                </CardContent>
              </Card>

              {/* Time Selection */}
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {t("Select Time")}
                    </CardTitle>
                    <CardDescription>
                      {t("Available time slots for")} {selectedDate.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {availableSlots.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        {t("No available slots on this day")}
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={selectedTime === slot ? "default" : "outline"}
                            onClick={() => setSelectedTime(slot)}
                            className="w-full"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Duration */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Duration")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                    <div className="space-y-2">
                      {DURATION_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value.toString()} id={`duration-${option.value}`} />
                          <Label htmlFor={`duration-${option.value}`} className="cursor-pointer flex-1">
                            {option.label}
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            {((lawyer.hourlyRate * option.value) / 60).toLocaleString()} XAF
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Consultation Type */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Consultation Type")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={consultationType} onValueChange={(val: any) => setConsultationType(val)}>
                    <div className="space-y-3">
                      {CONSULTATION_TYPES.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                          <Label htmlFor={`type-${type.value}`} className="cursor-pointer flex items-center gap-2">
                            {type.icon === 'Video' && <Video className="h-4 w-4" />}
                            {type.icon === 'Phone' && <Phone className="h-4 w-4" />}
                            {type.icon === 'Users' && <Users className="h-4 w-4" />}
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {consultationType === 'phone' && (
                    <div className="mt-4">
                      <Label htmlFor="phone">{t("Your Phone Number")} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+237 6XX XXX XXX"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("Additional Notes")}</CardTitle>
                  <CardDescription>
                    {t("Briefly describe what you'd like to discuss (optional)")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={t("e.g., I need advice on a contract dispute...")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{t("Booking Summary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("Lawyer")}</p>
                    <p className="font-medium">{lawyer.name}</p>
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("Date")}</p>
                      <p className="font-medium">{selectedDate.toLocaleDateString()}</p>
                    </div>
                  )}

                  {selectedTime && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("Time")}</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("Duration")}</p>
                    <p className="font-medium">{duration} {t("minutes")}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t("Type")}</p>
                    <p className="font-medium capitalize">{consultationType.replace('-', ' ')}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">{t("Total Fee")}</p>
                    <p className="text-2xl font-bold">{calculateTotal().toLocaleString()} XAF</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!selectedDate || !selectedTime || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {t("Submitting...")}
                      </>
                    ) : (
                      t("Submit Booking Request")
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {t("You'll be charged after the lawyer confirms")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
