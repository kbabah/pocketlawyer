import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get lawyer ID from params
    const lawyerId = params.id;
    
    if (!lawyerId) {
      return NextResponse.json({ error: 'Lawyer ID is required' }, { status: 400 });
    }
    
    // Get the lawyer document
    const lawyerDoc = await db.collection('lawyers').doc(lawyerId).get();
    
    if (!lawyerDoc.exists) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }
    
    const lawyerData = lawyerDoc.data();
    
    // Check if the authenticated user owns this lawyer profile
    if (lawyerData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this profile' }, { status: 403 });
    }
    
    // Get update data from request body
    const updateData = await req.json();
    
    // Fields that cannot be updated directly by the lawyer
    const restrictedFields = ['verified', 'active', 'userId', 'createdAt'];
    
    // Remove restricted fields from update data
    Object.keys(updateData).forEach(key => {
      if (restrictedFields.includes(key)) {
        delete updateData[key];
      }
    });
    
    // Add updatedAt field
    updateData.updatedAt = new Date().toISOString();
    
    // Update the lawyer document
    await db.collection('lawyers').doc(lawyerId).update(updateData);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Lawyer profile updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating lawyer profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update lawyer profile' },
      { status: 500 }
    );
  }
}