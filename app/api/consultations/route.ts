import { NextRequest, NextResponse } from 'next/server';
// Use Admin SDK for all backend operations
import { getFirebaseAdmin } from '@/lib/firebase-admin'; 
import { serverTimestamp } from 'firebase-admin/firestore'; // Use admin serverTimestamp
import { cookies } from 'next/headers';

async function verifyAuth(request: NextRequest) {
  try {
    const { auth } = await getFirebaseAdmin(); // Get admin auth instance
    const cookieStore = cookies(); // Use await removed as cookies() is not async
    const token = cookieStore.get('firebase-session')?.value;
    
    if (!token) {
      throw Object.assign(new Error('Unauthorized - No token'), { status: 401 });
    }

    const decodedToken = await auth.verifySessionCookie(token);
    return decodedToken.uid;
  } catch (error: any) {
    console.error("Auth verification error:", error); // Log the actual error
    throw Object.assign(new Error('Unauthorized'), { 
      status: error.status || 401,
      code: error.code
    });
  }
}

// Handle POST request for creating a new consultation booking
export async function POST(request: NextRequest) {
  let userId; // Define userId outside try block
  try {
    // Verify authentication and get userId
    userId = await verifyAuth(request);
    
    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.lawyerId || !body.date || !body.timeSlot || !body.timeSlot.start) { // Check for timeSlot.start
      return NextResponse.json(
        { error: 'Missing required fields: lawyerId, date, timeSlot.start' },
        { status: 400 }
      );
    }

    // Get adminDb instance
    const { adminDb } = await getFirebaseAdmin();

    // Get the lawyer details to determine hourlyRate
    const lawyerRef = adminDb.collection('lawyers').doc(body.lawyerId); // Use adminDb
    const lawyerSnap = await lawyerRef.get();
    
    if (!lawyerSnap.exists) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }
    
    const lawyerData = lawyerSnap.data();
    if (!lawyerData) {
       return NextResponse.json({ error: 'Lawyer data missing' }, { status: 500 }); // Handle missing lawyer data
    }


    // Calculate time slot end time (assuming 1 hour consultations)
    const [hours, minutes] = body.timeSlot.start.split(':').map(Number);
    const endHour = hours + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Create consultation data
    const consultationData = {
      lawyerId: body.lawyerId,
      clientId: userId, // Use verified userId
      subject: body.subject || `${body.consultationType || 'Legal'} Consultation`, // Use subject from body if provided
      description: body.description || '', // Use description from body
      date: body.date,
      timeSlot: {
        start: body.timeSlot.start,
        end: endTime,
      },
      timezone: body.timezone, // Store timezone
      consultationType: body.consultationType, // Store consultation type
      status: 'pending', // Initial status should likely be pending confirmation
      paymentStatus: 'pending',
      paymentAmount: lawyerData.hourlyRate || 0,
      notes: '',
      documents: [],
      createdAt: serverTimestamp(), // Use admin serverTimestamp
      updatedAt: serverTimestamp()  // Use admin serverTimestamp
    };

    // Save to Firestore
    const consultationsRef = adminDb.collection('consultations'); // Use adminDb
    const docRef = await consultationsRef.add(consultationData);

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Consultation booked successfully',
      consultationId: docRef.id
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error booking consultation:', error);
    // Check if it's an auth error from verifyAuth
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: error.status || 401 });
    }
    // General error
    return NextResponse.json(
      { error: 'Failed to book consultation' },
      { status: 500 }
    );
  }
}

// Handle GET request to fetch consultations for the current user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get userId
    const userId = await verifyAuth(request);
    
    // Query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'client'; // client or lawyer
    
    // Determine which field to query based on role
    const fieldToQuery = role === 'lawyer' ? 'lawyerId' : 'clientId';

    // Get adminDb instance
    const { adminDb } = await getFirebaseAdmin();
    
    // Get consultations from Firestore
    const consultationsRef = adminDb.collection('consultations'); // Use adminDb
    const q = consultationsRef.where(fieldToQuery, '==', userId); // Use adminDb query syntax
    const querySnapshot = await q.get();
    
    const consultations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ consultations });
  } catch (error: any) {
    console.error('Error fetching consultations:', error);
     // Check if it's an auth error from verifyAuth
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: error.status || 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}