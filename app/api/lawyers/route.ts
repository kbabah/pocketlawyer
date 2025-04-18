import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Start with base query for active and verified lawyers
    let query = db.collection('lawyers')
      .where('active', '==', true)
      .where('verified', '==', true);
    
    // Add filters if provided
    if (specialty) {
      query = query.where('specialties', 'array-contains', specialty);
    }
    
    if (language) {
      query = query.where('languages', 'array-contains', language);
    }
    
    // For location filtering (city/state), we need to do it after fetching
    // since Firestore doesn't support nested field filtering directly like this
    
    // Execute the query
    const lawyersSnapshot = await query.limit(limit).offset(offset).get();
    
    let lawyers = lawyersSnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      };
    });
    
    // Apply location filter if provided (client-side filtering)
    if (location) {
      const locationLower = location.toLowerCase();
      lawyers = lawyers.filter(lawyer => 
        lawyer.location.city?.toLowerCase().includes(locationLower) || 
        lawyer.location.state?.toLowerCase().includes(locationLower)
      );
    }
    
    return NextResponse.json({ lawyers });
    
  } catch (error: any) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lawyers' },
      { status: 500 }
    );
  }
}