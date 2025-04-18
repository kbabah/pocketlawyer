import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Consultation } from '@/types/lawyer';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const consultationData = await req.json();
    
    // Basic validation
    if (!consultationData.lawyerId || !consultationData.clientId || !consultationData.subject || 
        !consultationData.date || !consultationData.timeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify that the client ID in the request corresponds to a valid Firebase Auth user
    try {
      await getAuth().getUser(consultationData.clientId);
    } catch (authError) {
      console.error('Error verifying user:', authError);
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 403 });
    }
    
    // Fetch lawyer to verify they exist and are verified/active
    const lawyerDoc = await db.collection('lawyers').doc(consultationData.lawyerId).get();
    
    if (!lawyerDoc.exists) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }
    
    const lawyerData = lawyerDoc.data();
    
    if (!lawyerData.verified || !lawyerData.active) {
      return NextResponse.json({ error: 'Lawyer profile is not active' }, { status: 400 });
    }
    
    // Check if the time slot is available
    const dayOfWeek = new Date(consultationData.date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const schedule = lawyerData.availability?.schedule;
    
    if (!schedule || !schedule[dayOfWeek] || !schedule[dayOfWeek].available) {
      return NextResponse.json({ error: 'Lawyer is not available on this day' }, { status: 400 });
    }
    
    const requestedSlot = `${consultationData.timeSlot.start}-${consultationData.timeSlot.end}`;
    const availableSlot = schedule[dayOfWeek].slots.find(slot => 
      `${slot.start}-${slot.end}` === requestedSlot && !slot.booked
    );
    
    if (!availableSlot) {
      return NextResponse.json({ error: 'Selected time slot is not available' }, { status: 400 });
    }
    
    // Check for existing consultations at the same date/time to prevent double booking
    const existingConsultationsSnapshot = await db.collection('consultations')
      .where('lawyerId', '==', consultationData.lawyerId)
      .where('date', '==', consultationData.date)
      .where('timeSlot.start', '==', consultationData.timeSlot.start)
      .limit(1)
      .get();
    
    if (!existingConsultationsSnapshot.empty) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 });
    }

    // Create consultation with default values
    const newConsultation: Partial<Consultation> = {
      lawyerId: consultationData.lawyerId,
      clientId: consultationData.clientId,
      subject: consultationData.subject,
      description: consultationData.description || '',
      date: consultationData.date,
      timeSlot: consultationData.timeSlot,
      status: 'scheduled',
      paymentStatus: 'pending',
      paymentAmount: consultationData.paymentAmount || lawyerData.hourlyRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save the consultation to Firestore
    const consultationRef = await db.collection('consultations').add(newConsultation);
    
    // Update the lawyer's availability to mark the slot as booked
    // This is a simplistic approach - in a real app, you'd use a transaction
    // to ensure atomicity when updating multiple documents
    const dayScheduleRef = db.collection('lawyers')
      .doc(consultationData.lawyerId);
    
    await dayScheduleRef.update({
      [`availability.schedule.${dayOfWeek}.slots`]: schedule[dayOfWeek].slots.map(slot => {
        if (slot.start === consultationData.timeSlot.start && 
            slot.end === consultationData.timeSlot.end) {
          return { ...slot, booked: true };
        }
        return slot;
      })
    });
    
    // Create notifications for both lawyer and client
    await db.collection('notifications').add({
      userId: consultationData.clientId,
      type: 'consultation-booked',
      consultationId: consultationRef.id,
      message: `Your consultation with ${lawyerData.name} has been scheduled for ${consultationData.date} at ${consultationData.timeSlot.start}.`,
      read: false,
      createdAt: new Date().toISOString()
    });
    
    await db.collection('notifications').add({
      userId: lawyerData.userId,
      type: 'new-consultation',
      consultationId: consultationRef.id,
      clientName: 'A client', // In a real app, fetch the client's name
      message: `A new consultation has been scheduled for ${consultationData.date} at ${consultationData.timeSlot.start}.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Consultation booked successfully',
      consultationId: consultationRef.id
    });
  } catch (error: any) {
    console.error('Error booking consultation:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}