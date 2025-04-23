"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface TimeSlot {
  start: string
  end: string
}

interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

interface WeeklySchedule {
  [key: string]: DaySchedule
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DEFAULT_TIME_SLOTS = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" }
]

export function LawyerDashboardAvailability({ lawyerProfile }: { lawyerProfile: any }) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    lawyerProfile?.availability?.schedule || 
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: {
        enabled: false,
        slots: DEFAULT_TIME_SLOTS
      }
    }), {})
  )

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }))
  }

  const addTimeSlot = (day: string) => {
    const lastSlot = schedule[day].slots[schedule[day].slots.length - 1]
    const [hours, minutes] = lastSlot.end.split(':').map(Number)
    const newStart = lastSlot.end
    const newEnd = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: newStart, end: newEnd }]
      }
    }))
  }

  const removeTimeSlot = (day: string, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/lawyers/${lawyerProfile.id}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule })
      })

      if (!response.ok) {
        throw new Error('Failed to update availability')
      }

      toast({
        title: t("lawyer.availability.updated"),
        description: t("lawyer.availability.update.success")
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("lawyer.availability.update.error")
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("lawyer.availability.title")}</CardTitle>
        <CardDescription>{t("lawyer.availability.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {DAYS.map((day) => (
            <div key={day} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={schedule[day].enabled}
                  onCheckedChange={() => handleDayToggle(day)}
                />
                <Label htmlFor={`day-${day}`} className="capitalize">
                  {day}
                </Label>
              </div>

              {schedule[day].enabled && (
                <div className="ml-6 space-y-2">
                  {schedule[day].slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        {slot.start} - {slot.end}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(day, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(day)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("lawyer.availability.add.slot")}
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("lawyer.availability.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}