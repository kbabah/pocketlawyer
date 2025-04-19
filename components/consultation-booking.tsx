"use client"

import { useState } from 'react'
import { format, addMonths, isBefore, startOfDay, addDays } from 'date-fns'
import { CalendarIcon, Clock, Users, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Lawyer } from '@/types/lawyer'
import { auth } from '@/lib/firebase'

interface ConsultationBookingProps {
  lawyer: Lawyer
}

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export default function ConsultationBooking({ lawyer }: ConsultationBookingProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState<string | undefined>(undefined)
  const [consultationType, setConsultationType] = useState<string>("video")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Get list of available timezones
  const timezones = Intl.supportedValuesOf('timeZone')

  // Calculate booking window
  const maxDate = addDays(startOfDay(new Date()), 60)
  const today = startOfDay(new Date())

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setTimeSlot(undefined) // Reset time slot when date changes
  }

  const handleBookConsultation = async () => {
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    if (!date || !timeSlot || !consultationType || !timezone) {
      toast.error('Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      const token = await auth.currentUser?.getIdToken()
      
      if (!token) {
        throw new Error('Authentication token not available')
      }

      // Calculate end time (1 hour later)
      const [hours, minutes] = timeSlot.split(':').map(Number)
      const endTime = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

      const response = await fetch('/api/consultations/book', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lawyerId: lawyer.id,
          clientId: user.id,
          date: format(date, 'yyyy-MM-dd'),
          timeSlot: {
            start: timeSlot,
            end: endTime
          },
          timezone,
          consultationType,
          subject: `${consultationType.charAt(0).toUpperCase() + consultationType.slice(1)} Consultation`,
          description: additionalInfo || ''
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book consultation')
      }

      toast.success('Consultation booked successfully!')
      router.push('/profile/consultations')
    } catch (error: any) {
      console.error('Booking error:', error)
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        router.push(`/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      } else {
        toast.error(error.message || 'An error occurred while booking the consultation.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Consultation</CardTitle>
        <CardDescription>
          Book a consultation session with {lawyer.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Select Date</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, today) || date > maxDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Select Time (Your Local Time)</h3>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-3 gap-2">
            {lawyer.availability.schedule[format(date || new Date(), 'EEEE').toLowerCase()]?.slots.map((slot) => (
              <Button
                key={slot.start}
                variant={timeSlot === slot.start ? 'default' : 'outline'}
                className={cn(slot.booked && 'opacity-50 cursor-not-allowed')}
                onClick={() => !slot.booked && setTimeSlot(slot.start)}
                disabled={slot.booked}
              >
                <Clock className="mr-2 h-4 w-4" />
                {slot.start}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Consultation Type</h3>
          <Select 
            value={consultationType} 
            onValueChange={setConsultationType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select consultation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video Call</SelectItem>
              <SelectItem value="audio">Audio Call</SelectItem>
              <SelectItem value="chat">Text Chat</SelectItem>
              <SelectItem value="inPerson">In-Person Meeting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Additional Information</h3>
          <Textarea
            placeholder="Please provide a brief description of your legal matter..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>

        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Consultation Fee</div>
            <div className="font-bold">{lawyer.hourlyRate} FCFA</div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Duration: 1 hour
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBookConsultation} 
          disabled={loading || !date || !timeSlot || !consultationType || !timezone}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling Consultation...
            </>
          ) : (
            "Schedule Consultation"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}