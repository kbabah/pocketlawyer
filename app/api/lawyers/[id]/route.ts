import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lawyerId = params.id;
    
    if (!lawyerId) {
      return NextResponse.json(
        { error: 'Lawyer ID is required' },
        { status: 400 }
      );
    }
    
    // Get lawyer document from Firestore
    const lawyerDoc = await db.collection('lawyers').doc(lawyerId).get();
    
    if (!lawyerDoc.exists) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      );
    }
    
    // Check if lawyer is active and verified
    const lawyerData = lawyerDoc.data();
    
    if (!lawyerData?.active || !lawyerData?.verified) {
      return NextResponse.json(
        { error: 'Lawyer profile is not active' },
        { status: 403 }
      );
    }
    
    // Return lawyer data with ID
    return NextResponse.json({
      id: lawyerDoc.id,
      ...lawyerData
    });
    
  } catch (error: any) {
    console.error('Error fetching lawyer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lawyer' },
      { status: 500 }
    );
  }
}