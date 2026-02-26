import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { adminAuth } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { generateMeetingLink, MeetingDetails } from '@/lib/server/meeting-service';

/**
 * Check if a time slot is available (server-side, using Admin SDK)
 */
async function isTimeSlotAvailableServer(
  lawyerId: string,
  date: Date,
  duration: number
): Promise<boolean> {
  const endTime = new Date(date.getTime() + duration * 60000);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const snapshot = await adminDb
    .collection('bookings')
    .where('lawyerId', '==', lawyerId)
    .where('date', '>=', Timestamp.fromDate(dayStart))
    .where('date', '<=', Timestamp.fromDate(dayEnd))
    .where('status', 'in', ['pending', 'confirmed'])
    .get();

  for (const doc of snapshot.docs) {
    const booking = doc.data();
    const bookingStart = booking.date.toDate();
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

    if (
      (date >= bookingStart && date < bookingEnd) ||
      (endTime > bookingStart && endTime <= bookingEnd) ||
      (date <= bookingStart && endTime >= bookingEnd)
    ) {
      return false;
    }
  }

  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Get the authorization header and verify token
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No authentication token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the Firebase auth token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error('Token verification failed:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 401 }
      );
    }

    // Parse the request body
    const bookingData = await req.json();

    // Validate required fields
    const requiredFields = [
      'userId',
      'userName',
      'userEmail',
      'lawyerId',
      'lawyerName',
      'lawyerEmail',
      'date',
      'duration',
      'type',
      'totalAmount',
    ];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Ensure the userId matches the authenticated user
    if (bookingData.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Unauthorized - User ID mismatch' },
        { status: 403 }
      );
    }

    const consultationDate = new Date(bookingData.date);

    // Check availability server-side (bypasses Firestore read rules)
    const available = await isTimeSlotAvailableServer(
      bookingData.lawyerId,
      consultationDate,
      bookingData.duration
    );

    if (!available) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another time.' },
        { status: 409 }
      );
    }

    // Create booking document using Admin SDK
    const bookingsRef = adminDb.collection('bookings');
    const bookingDoc = bookingsRef.doc();

    // Generate meeting link for video consultations
    let meetingDetails: MeetingDetails | null = null;
    if (bookingData.type === 'video') {
      try {
        meetingDetails = await generateMeetingLink({
          bookingId: bookingDoc.id,
          lawyerName: bookingData.lawyerName,
          userName: bookingData.userName,
          startTime: consultationDate,
          duration: bookingData.duration,
          provider: 'jitsi',
        });
      } catch (error) {
        console.error('Failed to generate meeting link:', error);
      }
    }

    const booking: any = {
      userId: bookingData.userId,
      userName: bookingData.userName,
      userEmail: bookingData.userEmail,
      lawyerId: bookingData.lawyerId,
      lawyerName: bookingData.lawyerName,
      lawyerEmail: bookingData.lawyerEmail,
      date: Timestamp.fromDate(consultationDate),
      duration: bookingData.duration,
      type: bookingData.type,
      status: bookingData.status || 'pending',
      totalAmount: bookingData.totalAmount,
      paymentStatus: bookingData.paymentStatus || 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (bookingData.userPhone) {
      booking.userPhone = bookingData.userPhone;
    }
    if (bookingData.notes) {
      booking.notes = bookingData.notes;
    }
    if (meetingDetails) {
      booking.meetingLink = meetingDetails.meetingLink;
      booking.meetingId = meetingDetails.meetingId;
      booking.meetingProvider = meetingDetails.provider;
    }

    await bookingDoc.set(booking);

    return NextResponse.json(
      {
        success: true,
        bookingId: bookingDoc.id,
        message: 'Booking created successfully',
        meetingLink: meetingDetails?.meetingLink || null,
        meetingProvider: meetingDetails?.provider || null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating booking:', error);

    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
