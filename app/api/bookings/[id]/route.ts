import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { generateMeetingLink } from '@/lib/server/meeting-service';
import { FieldValue } from 'firebase-admin/firestore';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const { id: bookingId } = await params;
    const { action, meetingLink, cancelledBy, reason } = await req.json();

    // Fetch the booking
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingSnap.data()!;

    // Check if requesting user is the client
    const isUser = booking.userId === uid;

    // Check if requesting user is the lawyer for this booking
    let isLawyer = false;
    if (!isUser) {
      const lawyersSnapshot = await adminDb
        .collection('lawyers')
        .where('userId', '==', uid)
        .limit(1)
        .get();

      if (!lawyersSnapshot.empty) {
        isLawyer = lawyersSnapshot.docs[0].id === booking.lawyerId;
      }
    }

    if (!isUser && !isLawyer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };

    switch (action) {
      case 'confirm': {
        if (!isLawyer) {
          return NextResponse.json({ error: 'Only the lawyer can confirm bookings' }, { status: 403 });
        }
        if (booking.status !== 'pending') {
          return NextResponse.json({ error: 'Booking is not pending' }, { status: 400 });
        }
        updates.status = 'confirmed';

        // If this is a video consultation and no meeting link is provided or exists, auto-generate one
        const isVideo = booking.type === 'video';
        const hasExistingLink = Boolean(booking.meetingLink);

        if (meetingLink) {
          updates.meetingLink = meetingLink;
        } else if (isVideo && !hasExistingLink) {
          try {
            const startTime: Date = booking.date?.toDate ? booking.date.toDate() : new Date(booking.date);
            const details = await generateMeetingLink({
              bookingId: bookingId,
              lawyerName: booking.lawyerName,
              userName: booking.userName,
              startTime,
              duration: booking.duration,
            });
            updates.meetingLink = details.meetingLink;
            updates.meetingId = details.meetingId;
            updates.meetingProvider = details.provider;
            updates.meetingPin = details.pin ?? null;
            updates.meetingDialInNumber = details.dialInNumber ?? null;
          } catch (e) {
            console.error('Failed to auto-generate meeting link on confirm:', e);
            // Do not fail confirmation due to link generation issues
          }
        }
        break;
      }

      case 'cancel':
        if (booking.status === 'completed') {
          return NextResponse.json({ error: 'Cannot cancel a completed booking' }, { status: 400 });
        }
        updates.status = 'cancelled';
        updates.cancelledBy = cancelledBy ?? (isLawyer ? 'lawyer' : 'user');
        updates.cancellationReason = reason ?? 'Cancelled';
        break;

      case 'complete':
        if (!isLawyer) {
          return NextResponse.json({ error: 'Only the lawyer can complete bookings' }, { status: 403 });
        }
        if (booking.status !== 'confirmed') {
          return NextResponse.json({ error: 'Booking is not confirmed' }, { status: 400 });
        }
        updates.status = 'completed';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await bookingRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
