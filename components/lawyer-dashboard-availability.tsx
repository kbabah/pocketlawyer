import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lawyer } from '@/types/lawyer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, Loader2, Plus, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface LawyerDashboardAvailabilityProps {
  lawyerProfile: Partial<Lawyer>;
}

interface TimeSlot {
  start: string;
  end: string;
  booked: boolean;
}

interface DaySchedule {
  available: boolean;
  slots: TimeSlot[];
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

export function LawyerDashboardAvailability({ lawyerProfile }: LawyerDashboardAvailabilityProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize schedule state from the lawyer profile or with defaults
  const [schedule, setSchedule] = useState<WeekSchedule>(
    lawyerProfile.availability?.schedule || {
      monday: { available: true, slots: [] },
      tuesday: { available: true, slots: [] },
      wednesday: { available: true, slots: [] },
      thursday: { available: true, slots: [] },
      friday: { available: true, slots: [] },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] }
    }
  );

  // Get day name from index
  const getDayName = (index: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[index];
  };

  // Format display name for day
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Toggle day availability
  const toggleDayAvailability = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available
      }
    }));
  };

  // Add a new time slot to a specific day
  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          { start: '09:00', end: '10:00', booked: false }
        ]
      }
    }));
  };

  // Remove a time slot from a specific day
  const removeTimeSlot = (day: string, index: number) => {
    // Don't allow removing if it's already booked
    if (schedule[day].slots[index].booked) {
      toast({
        title: "Cannot Remove Booked Slot",
        description: "This time slot has an existing booking and cannot be removed.",
        variant: "destructive",
      });
      return;
    }

    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index)
      }
    }));
  };

  // Update time slot
  const updateTimeSlot = (day: string, index: number, field: keyof TimeSlot, value: string | boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) => {
          if (i === index) {
            return { ...slot, [field]: value };
          }
          return slot;
        })
      }
    }));
  };

  // Validate time slots
  const validateTimeSlots = (): boolean => {
    let isValid = true;
    let errorMessage = '';

    Object.entries(schedule).forEach(([day, daySchedule]) => {
      if (!daySchedule.available) return;

      // Check if there are any time slots for available days
      if (daySchedule.slots.length === 0) {
        isValid = false;
        errorMessage = `You need to add at least one time slot for ${formatDayName(day)}`;
        return;
      }

      // Check for valid time format and order (start time < end time)
      daySchedule.slots.forEach((slot, index) => {
        const startTime = slot.start.split(':').map(Number);
        const endTime = slot.end.split(':').map(Number);

        if (startTime[0] > endTime[0] || (startTime[0] === endTime[0] && startTime[1] >= endTime[1])) {
          isValid = false;
          errorMessage = `Invalid time slot on ${formatDayName(day)}: End time must be after start time`;
          return;
        }
      });

      // Check for overlapping time slots
      for (let i = 0; i < daySchedule.slots.length; i++) {
        const slotA = daySchedule.slots[i];
        const startA = slotA.start.split(':').map(Number);
        const endA = slotA.end.split(':').map(Number);

        for (let j = i + 1; j < daySchedule.slots.length; j++) {
          const slotB = daySchedule.slots[j];
          const startB = slotB.start.split(':').map(Number);
          const endB = slotB.end.split(':').map(Number);

          // Check for overlap
          if (
            (startA[0] < endB[0] || (startA[0] === endB[0] && startA[1] < endB[1])) &&
            (startB[0] < endA[0] || (startB[0] === endA[0] && startB[1] < endA[1]))
          ) {
            isValid = false;
            errorMessage = `Overlapping time slots on ${formatDayName(day)}`;
            return;
          }
        }
      }
    });

    if (!isValid) {
      toast({
        title: "Invalid Schedule",
        description: errorMessage,
        variant: "destructive",
      });
    }

    return isValid;
  };

  // Save availability schedule
  const saveAvailability = async () => {
    // Validate before saving
    if (!validateTimeSlots()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/lawyers/${lawyerProfile.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availability: {
            schedule
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update availability');
      }

      toast({
        title: "Availability Updated",
        description: "Your availability has been updated successfully.",
      });

      // Refresh the page to get the updated profile data
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Availability Management</CardTitle>
          <CardDescription>Set your consultation schedule and manage your availability</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!lawyerProfile.verified && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Profile Not Verified</AlertTitle>
              <AlertDescription>
                You can set your availability now, but clients will not be able to book consultations until your profile is verified.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['monday', 'tuesday', 'wednesday', 'thursday', 'friday']}>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                const dayName = getDayName(dayIndex);
                const daySchedule = schedule[dayName];

                return (
                  <AccordionItem key={dayName} value={dayName}>
                    <AccordionTrigger className="hover:bg-accent hover:no-underline px-4 rounded-md">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`available-${dayName}`}
                          checked={daySchedule.available}
                          onCheckedChange={() => toggleDayAvailability(dayName)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Label
                          htmlFor={`available-${dayName}`}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayAvailability(dayName);
                          }}
                        >
                          {formatDayName(dayName)}
                        </Label>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pt-2">
                      {daySchedule.available ? (
                        <div className="space-y-4 py-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">Set your available time slots for {formatDayName(dayName)}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(dayName)}
                              className="h-8"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Slot
                            </Button>
                          </div>

                          {daySchedule.slots.length === 0 ? (
                            <p className="text-sm text-center py-4 text-muted-foreground">
                              No time slots added. Click "Add Slot" to create availability.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {daySchedule.slots.map((slot, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="grid grid-cols-2 gap-2 flex-1">
                                    <div className="space-y-1">
                                      <Label htmlFor={`${dayName}-start-${index}`} className="text-xs">
                                        Start Time
                                      </Label>
                                      <Input
                                        id={`${dayName}-start-${index}`}
                                        type="time"
                                        value={slot.start}
                                        onChange={(e) => updateTimeSlot(dayName, index, 'start', e.target.value)}
                                        disabled={slot.booked}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label htmlFor={`${dayName}-end-${index}`} className="text-xs">
                                        End Time
                                      </Label>
                                      <Input
                                        id={`${dayName}-end-${index}`}
                                        type="time"
                                        value={slot.end}
                                        onChange={(e) => updateTimeSlot(dayName, index, 'end', e.target.value)}
                                        disabled={slot.booked}
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTimeSlot(dayName, index)}
                                    disabled={slot.booked}
                                    className="h-8 mt-5"
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-center py-4 text-muted-foreground">
                          This day is marked as unavailable.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={saveAvailability} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Schedule'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Setting Your Schedule</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li className="text-sm">Select the days when you are available for consultations</li>
              <li className="text-sm">Add specific time slots for each available day</li>
              <li className="text-sm">Ensure time slots do not overlap</li>
              <li className="text-sm">You can add multiple time slots per day</li>
            </ul>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Managing Bookings</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li className="text-sm">Booked time slots cannot be modified</li>
              <li className="text-sm">You can add new time slots at any time</li>
              <li className="text-sm">Changes will not affect existing bookings</li>
              <li className="text-sm">Remember to update your schedule regularly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}