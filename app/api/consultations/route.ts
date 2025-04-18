import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { auth as adminAuth } from '@/lib/firebase-admin';

// Handle POST request for creating a new consultation booking
export async function POST(request: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    
    let decodedToken;
    try {
      // Verify the Firebase ID token
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.lawyerId || !body.date || !body.timeSlot) {
      return NextResponse.json(
        { error: 'Missing required fields: lawyerId, date, timeSlot' },
        { status: 400 }
      );
    }

    // Get userId from the verified token
    const userId = decodedToken.uid;

    // Get the lawyer details to determine hourlyRate
    const lawyerRef = doc(db, 'lawyers', body.lawyerId);
    const lawyerSnap = await getDoc(lawyerRef);
    
    if (!lawyerSnap.exists()) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }
    
    const lawyerData = lawyerSnap.data();

    // Calculate time slot end time (assuming 1 hour consultations)
    const startTime = body.timeSlot;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Create consultation data
    const consultationData = {
      id: uuidv4(),
      lawyerId: body.lawyerId,
      clientId: userId,
      subject: body.consultationType || 'Legal Consultation',
      description: body.additionalInfo || '',
      date: body.date,
      timeSlot: {
        start: startTime,
        end: endTime,
      },
      status: 'scheduled',
      paymentStatus: 'pending',
      paymentAmount: lawyerData.hourlyRate || 0,
      notes: '',
      documents: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    const consultationsRef = collection(db, 'consultations');
    const docRef = await addDoc(consultationsRef, consultationData);

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Consultation booked successfully',
      consultationId: docRef.id
    }, { status: 201 });

  } catch (error) {
    console.error('Error booking consultation:', error);
    return NextResponse.json(
      { error: 'Failed to book consultation' },
      { status: 500 }
    );
  }
}

// Handle GET request to fetch consultations for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    
    let decodedToken;
    try {
      // Verify the Firebase ID token
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get userId from the verified token
    const userId = decodedToken.uid;
    
    // Query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'client'; // client or lawyer
    
    // Determine which field to query based on role
    const fieldToQuery = role === 'lawyer' ? 'lawyerId' : 'clientId';
    
    // Get consultations from Firestore
    const consultationsRef = collection(db, 'consultations');
    const q = query(consultationsRef, where(fieldToQuery, '==', userId));
    const querySnapshot = await getDocs(q);
    
    const consultations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Return consultations
    return NextResponse.json({ consultations });

  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}