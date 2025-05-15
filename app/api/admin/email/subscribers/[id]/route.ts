import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import * as z from 'zod';

// Validation schema for updating subscribers
const updateSubscriberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  name: z.string().optional(),
  status: z.enum(['active', 'inactive', 'unsubscribed']).optional(),
});

// Validation schema for patching status
const patchStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'unsubscribed']),
});

// Get a single subscriber by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = adminDb.collection('newsletter-subscribers').doc(params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error: any) {
    console.error('Error fetching subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriber' },
      { status: 500 }
    );
  }
}

// Update a subscriber (full update)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Validate the data
    const result = updateSubscriberSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid subscriber data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { email, name, status } = result.data;
    
    // Check if the subscriber exists
    const docRef = adminDb.collection('newsletter-subscribers').doc(params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }
    
    // If email is changing, check if the new email already exists
    if (email && email !== doc.data()?.email) {
      const existingSubscriber = await adminDb
        .collection('newsletter-subscribers')
        .where('email', '==', email)
        .get();
        
      if (!existingSubscriber.empty) {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 400 }
        );
      }
    }
    
    // Update fields that are provided
    const updateData: Record<string, any> = {};
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name || null; // Allow clearing name
    if (status) updateData.status = status;
    updateData.updatedAt = new Date().toISOString();
    
    await docRef.update(updateData);
    
    // Get the updated document
    const updatedDoc = await docRef.get();
    
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error: any) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// Update only the status (patch operation)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // Validate the data
    const result = patchStatusSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid status data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { status } = result.data;
    
    // Check if the subscriber exists
    const docRef = adminDb.collection('newsletter-subscribers').doc(params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }
    
    // Update status
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.update(updateData);
    
    // Get the updated document
    const updatedDoc = await docRef.get();
    
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error: any) {
    console.error('Error updating subscriber status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscriber status' },
      { status: 500 }
    );
  }
}

// Delete a subscriber
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = adminDb.collection('newsletter-subscribers').doc(params.id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }
    
    await docRef.delete();
    
    return NextResponse.json(
      { message: "Subscriber deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}