import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { Lawyer } from '@/types/lawyer';

export async function POST(req: NextRequest) {
  try {
    // Log headers for debugging
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
      console.log('Token verified for user:', decodedToken.uid);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    // Parse request body
    const lawyerData = await req.json();
    console.log('Received lawyer data:', JSON.stringify(lawyerData, null, 2));
    
    // Detailed validation logging
    const missingFields = [];
    if (!lawyerData.userId) missingFields.push('userId');
    if (!lawyerData.name) missingFields.push('name');
    if (!lawyerData.email) missingFields.push('email');
    if (!lawyerData.specialties) missingFields.push('specialties');
    if (!lawyerData.bio) missingFields.push('bio');

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return NextResponse.json({ 
        error: 'Missing required fields', 
        missingFields 
      }, { status: 400 });
    }
    
    // Verify that the user ID in the request matches the authenticated user
    if (decodedToken.uid !== lawyerData.userId) {
      console.log('User ID mismatch:', { tokenUid: decodedToken.uid, requestUid: lawyerData.userId });
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
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