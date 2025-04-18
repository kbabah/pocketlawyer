import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Lawyer } from '@/types/lawyer';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const lawyerData = await req.json();
    
    // Basic validation
    if (!lawyerData.userId || !lawyerData.name || !lawyerData.email || !lawyerData.specialties || !lawyerData.bio) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify that the user ID in the request corresponds to a valid Firebase Auth user
    try {
      const userRecord = await getAuth().getUser(lawyerData.userId);
      
      // Check if email matches the authenticated user
      if (userRecord.email !== lawyerData.email) {
        return NextResponse.json({ error: 'Email does not match authenticated user' }, { status: 403 });
      }
    } catch (authError) {
      console.error('Error verifying user:', authError);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 403 });
    }
    
    // Check if lawyer profile already exists for this user
    const existingLawyerSnapshot = await db.collection('lawyers')
      .where('userId', '==', lawyerData.userId)
      .limit(1)
      .get();
    
    if (!existingLawyerSnapshot.empty) {
      return NextResponse.json({ 
        error: 'A lawyer profile already exists for this user', 
        lawyerId: existingLawyerSnapshot.docs[0].id 
      }, { status: 409 });
    }

    // Add default fields
    const newLawyer: Partial<Lawyer> = {
      ...lawyerData,
      verified: false,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save the lawyer profile to Firestore
    const lawyerRef = await db.collection('lawyers').add(newLawyer);
    
    // Create notification for admin to review the profile
    await db.collection('admin-notifications').add({
      type: 'lawyer-registration',
      lawyerId: lawyerRef.id,
      lawyerName: lawyerData.name,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Lawyer profile submitted for verification',
      lawyerId: lawyerRef.id
    });
  } catch (error: any) {
    console.error('Error registering lawyer:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}