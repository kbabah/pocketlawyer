"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  date?: Date | null
  setDate: (date: Date | null) => void
  granularity?: "day" | "minute" | "second"
  disabled?: boolean
}

export function DateTimePicker({ date, setDate, granularity = "day", disabled = false }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<{
    hours: string;
    minutes: string;
    seconds: string;
  }>({
    hours: date ? format(date, "HH") : "00",
    minutes: date ? format(date, "mm") : "00",
    seconds: date ? format(date, "ss") : "00",
  });

  // Update the date with the selected time
  const updateDateWithTime = React.useCallback((newDate: Date | undefined) => {
    if (!newDate) {
      setDate(null);
      return;
    }

    const hours = parseInt(selectedTime.hours, 10);
    const minutes = parseInt(selectedTime.minutes, 10);
    const seconds = parseInt(selectedTime.seconds, 10);

    const updatedDate = new Date(newDate);
    updatedDate.setHours(hours, minutes, seconds);
    setDate(updatedDate);
  }, [selectedTime, setDate]);

  // Update time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime({
        hours: format(date, "HH"),
        minutes: format(date, "mm"),
        seconds: format(date, "ss"),
      });
    }
  }, [date]);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
  const seconds = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, granularity === "minute" ? "PPp" : granularity === "second" ? "PPp:ss" : "PP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(day) => updateDateWithTime(day || undefined)}
          initialFocus
        />
        {granularity !== "day" && (
          <div className="border-t p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={selectedTime.hours}
                  onValueChange={(value) => {
                    setSelectedTime(prev => ({ ...prev, hours: value }));
                    if (date) {
                      const newDate = new Date(date);
                      newDate.setHours(parseInt(value, 10), parseInt(selectedTime.minutes, 10), parseInt(selectedTime.seconds, 10));
                      setDate(newDate);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTime.minutes}
                  onValueChange={(value) => {
                    setSelectedTime(prev => ({ ...prev, minutes: value }));
                    if (date) {
                      const newDate = new Date(date);
                      newDate.setMinutes(parseInt(value, 10));
                      setDate(newDate);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {granularity === "second" && (
                  <Select
                    value={selectedTime.seconds}
                    onValueChange={(value) => {
                      setSelectedTime(prev => ({ ...prev, seconds: value }));
                      if (date) {
                        const newDate = new Date(date);
                        newDate.setSeconds(parseInt(value, 10));
                        setDate(newDate);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="SS" />
                    </SelectTrigger>
                    <SelectContent>
                      {seconds.map((second) => (
                        <SelectItem key={second} value={second}>{second}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}