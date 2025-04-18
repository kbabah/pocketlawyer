"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Users } from 'lucide-react'
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
      toast.error(t('consultation.login.required'))
      router.push('/sign-in')
      return
    }

    if (!date || !timeSlot || !consultationType) {
      toast.error(t('consultation.fields.required'))
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

      toast.success(t('consultation.booking.success'))
      router.push('/profile')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(t('consultation.booking.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('consultation.booking.title')}</CardTitle>
        <CardDescription>
          {t('consultation.booking.description')} {lawyer.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('consultation.select.date')}</h3>
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
                {date ? format(date, 'PPP') : t('consultation.choose.date')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('consultation.select.time')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.id}
                variant={timeSlot === slot.time ? 'default' : 'outline'}
                className={cn(!slot.available && 'opacity-50 cursor-not-allowed')}
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
          <h3 className="text-sm font-medium">{t('consultation.type')}</h3>
          <Select 
            value={consultationType} 
            onValueChange={setConsultationType}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('consultation.select.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">{t('consultation.type.video')}</SelectItem>
              <SelectItem value="audio">{t('consultation.type.audio')}</SelectItem>
              <SelectItem value="chat">{t('consultation.type.chat')}</SelectItem>
              <SelectItem value="inPerson">{t('consultation.type.in.person')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t('consultation.additional.info')}</h3>
          <Textarea
            placeholder={t('consultation.additional.info.placeholder')}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>

        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{t('consultation.fee')}</div>
            <div className="font-bold">{lawyer.hourlyRate}</div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {t('consultation.duration')}: 1 {t('consultation.hour')}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleBookConsultation} 
          disabled={loading || !date || !timeSlot || !consultationType}
        >
          {loading ? t('consultation.booking.processing') : t('consultation.book.now')}
        </Button>
      </CardFooter>
    </Card>
  )
}