"use client"

import { useState } from 'react'
import { format, addMonths } from 'date-fns'
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

  // Mock time slots - in a real app, this would come from an API based on lawyer availability
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00', available: true },
    { id: '2', time: '10:00', available: true },
    { id: '3', time: '11:00', available: true },
    { id: '4', time: '12:00', available: false },
    { id: '5', time: '13:00', available: false },
    { id: '6', time: '14:00', available: true },
    { id: '7', time: '15:00', available: true },
    { id: '8', time: '16:00', available: true },
    { id: '9', time: '17:00', available: true },
  ]

  const handleBookConsultation = async () => {
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    if (!date || !timeSlot || !consultationType) {
      toast.error('Please fill in all required fields.')
      return
    }

    setLoading(true)

    try {
      // Get the current user's ID token
      const token = await auth.currentUser?.getIdToken()
      
      if (!token) {
        throw new Error('Authentication token not available')
      }

      // Make the API call with the token in the Authorization header
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lawyerId: lawyer.id,
          userId: user.id,
          date: format(date, 'yyyy-MM-dd'),
          timeSlot,
          consultationType,
          additionalInfo
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to book consultation')
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
                {date ? format(date, 'PPP') : 'Select a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date > addMonths(new Date(), 2)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Available Time Slots</h3>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={timeSlot === slot.time ? 'default' : 'outline'}
                className={cn(!slot.available && 'opacity-50')}
                onClick={() => slot.available && setTimeSlot(slot.time)}
                disabled={!slot.available}
              >
                <Clock className="mr-2 h-4 w-4" />
                {slot.time}
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
          disabled={loading || !date || !timeSlot || !consultationType}
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