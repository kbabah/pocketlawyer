import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Consultation } from '@/types/lawyer';
import { rateLimitRequest, getRateLimitContext } from '@/lib/rate-limit';
import { parse, isValid, isFuture, startOfDay, addDays } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

const MAX_BOOKING_DAYS_AHEAD = 60; // Allow booking up to 60 days in advance

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting - 5 booking attempts per minute
    const rateLimit = await rateLimitRequest(
      getRateLimitContext(req),
      { windowMs: 60000, maxRequests: 5 }
    );

    if (!rateLimit.success) {
      return rateLimit.response;
    }

    // Parse request body
    const consultationData = await req.json();
    
    // Enhanced validation
    if (!consultationData.lawyerId || 
        !consultationData.clientId || 
        !consultationData.subject || 
        !consultationData.date || 
        !consultationData.timeSlot ||
        !consultationData.timezone) {
      return NextResponse.json({ 
        error: 'Missing required fields. Please provide lawyerId, clientId, subject, date, timeSlot, and timezone' 
      }, { status: 400 });
    }

    // Validate date and time format
    const consultationDate = parse(consultationData.date, 'yyyy-MM-dd', new Date());
    if (!isValid(consultationDate)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Please use YYYY-MM-DD format' 
      }, { status: 400 });
    }

    // Convert consultation time to UTC based on client timezone
    const startTime = zonedTimeToUtc(
      `${consultationData.date} ${consultationData.timeSlot.start}`,
      consultationData.timezone
    );

    // Validate future date
    if (!isFuture(startTime)) {
      return NextResponse.json({ 
        error: 'Consultation date must be in the future' 
      }, { status: 400 });
    }

    // Validate booking window
    const maxDate = addDays(startOfDay(new Date()), MAX_BOOKING_DAYS_AHEAD);
    if (consultationDate > maxDate) {
      return NextResponse.json({ 
        error: `Consultations can only be booked up to ${MAX_BOOKING_DAYS_AHEAD} days in advance` 
      }, { status: 400 });
    }

    // Verify client identity and get client data
    let clientData;
    try {
      const userRecord = await getAuth().getUser(consultationData.clientId);
      clientData = userRecord;
    } catch (authError) {
      console.error('Error verifying user:', authError);
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 403 });
    }

    // Start a Firestore transaction
    const result = await db.runTransaction(async (transaction) => {
      // Get lawyer document
      const lawyerDoc = await transaction.get(
        db.collection('lawyers').doc(consultationData.lawyerId)
      );

      if (!lawyerDoc.exists) {
        throw new Error('Lawyer not found');
      }

      const lawyerData = lawyerDoc.data();
      
      if (!lawyerData.verified || !lawyerData.active) {
        throw new Error('Lawyer profile is not active');
      }

      // Check availability
      const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const schedule = lawyerData.availability?.schedule;

      if (!schedule?.[dayOfWeek]?.available) {
        throw new Error('Lawyer is not available on this day');
      }

      const requestedSlot = `${consultationData.timeSlot.start}-${consultationData.timeSlot.end}`;
      const availableSlot = schedule[dayOfWeek].slots.find(slot => 
        `${slot.start}-${slot.end}` === requestedSlot && !slot.booked
      );

      if (!availableSlot) {
        throw new Error('Selected time slot is not available');
      }

      // Check for existing consultations
      const existingConsultations = await transaction.get(
        db.collection('consultations')
          .where('lawyerId', '==', consultationData.lawyerId)
          .where('date', '==', consultationData.date)
          .where('timeSlot.start', '==', consultationData.timeSlot.start)
      );

      if (!existingConsultations.empty) {
        throw new Error('This time slot is no longer available');
      }

      // Create consultation
      const newConsultation: Partial<Consultation> = {
        lawyerId: consultationData.lawyerId,
        clientId: consultationData.clientId,
        subject: consultationData.subject,
        description: consultationData.description || '',
        date: consultationData.date,
        timeSlot: consultationData.timeSlot,
        timezone: consultationData.timezone,
        status: 'scheduled',
        paymentStatus: 'pending',
        paymentAmount: consultationData.paymentAmount || lawyerData.hourlyRate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create consultation document
      const consultationRef = db.collection('consultations').doc();
      transaction.create(consultationRef, newConsultation);

      // Update lawyer's availability
      transaction.update(lawyerDoc.ref, {
        [`availability.schedule.${dayOfWeek}.slots`]: schedule[dayOfWeek].slots.map(slot => {
          if (slot.start === consultationData.timeSlot.start && 
              slot.end === consultationData.timeSlot.end) {
            return { ...slot, booked: true };
          }
          return slot;
        })
      });

      // Create notifications
      const clientNotification = {
        userId: consultationData.clientId,
        type: 'consultation-booked',
        consultationId: consultationRef.id,
        message: `Your consultation with ${lawyerData.name} has been scheduled for ${consultationData.date} at ${consultationData.timeSlot.start} ${consultationData.timezone}.`,
        read: false,
        createdAt: new Date().toISOString()
      };

      const lawyerNotification = {
        userId: lawyerData.userId,
        type: 'new-consultation',
        consultationId: consultationRef.id,
        clientName: clientData.displayName || clientData.email,
        message: `New consultation scheduled with ${clientData.displayName || clientData.email} for ${consultationData.date} at ${consultationData.timeSlot.start} ${consultationData.timezone}.`,
        read: false,
        createdAt: new Date().toISOString()
      };

      const notificationsRef = db.collection('notifications');
      transaction.create(notificationsRef.doc(), clientNotification);
      transaction.create(notificationsRef.doc(), lawyerNotification);

      return {
        consultationId: consultationRef.id,
        success: true
      };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Consultation booked successfully',
      consultationId: result.consultationId
    });

  } catch (error: any) {
    console.error('Error booking consultation:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: error.stack
    }, { status: error.message.includes('not found') ? 404 : 500 });
  }
}