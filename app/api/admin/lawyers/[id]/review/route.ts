import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { verifyAdmin } from '../../../middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const adminId = await verifyAdmin(request);

    const lawyerId = params.id;
    const { action, reason } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the lawyer document
    const lawyerDoc = await db.collection('lawyers').doc(lawyerId).get();
    
    if (!lawyerDoc.exists) {
      return NextResponse.json(
        { error: 'Lawyer profile not found' },
        { status: 404 }
      );
    }

    const lawyerData = lawyerDoc.data();

    // Start a transaction to update lawyer status and create notification
    await db.runTransaction(async (transaction) => {
      // Update lawyer profile
      transaction.update(lawyerDoc.ref, {
        verified: action === 'approve',
        active: action === 'approve',
        updatedAt: new Date().toISOString(),
        reviewedBy: adminId,
        reviewedAt: new Date().toISOString(),
        reviewNotes: reason || null
      });

      // Create notification for the lawyer
      const notificationRef = db.collection('notifications').doc();
      transaction.create(notificationRef, {
        userId: lawyerData?.userId,
        type: action === 'approve' ? 'lawyer-approved' : 'lawyer-rejected',
        title: action === 'approve' ? 'Profile Approved' : 'Profile Rejected',
        message: action === 'approve' 
          ? 'Your lawyer profile has been approved. You can now start accepting consultations.'
          : `Your lawyer profile has been rejected. Reason: ${reason || 'No reason provided'}`,
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    return NextResponse.json({
      success: true,
      message: `Lawyer profile ${action}d successfully`
    });
  } catch (error: any) {
    console.error('Error reviewing lawyer profile:', error);
    
    // Enhanced error handling with more specific status codes
    if (error.message.includes('Missing or invalid authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized access - invalid or missing token' },
        { status: 401 }
      );
    } else if (error.message.includes('not an admin')) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    } else if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Authentication token expired' },
        { status: 401 }
      );
    } else if (error.code === 'failed-precondition') {
      // Transaction failed
      return NextResponse.json(
        { error: 'Failed to update profile due to a conflict with another operation' },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        { error: 'Internal server error while processing lawyer review' },
        { status: 500 }
      );
    }
  }
}