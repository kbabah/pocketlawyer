import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email-service';
import * as z from 'zod';

// Validation schema for creating/updating subscribers
const subscriberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
  status: z.enum(['active', 'inactive', 'unsubscribed']),
  source: z.string().optional(),
});

// Get all subscribers (with optional email filter)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    let query = adminDb.collection('newsletter-subscribers');
    
    // Apply email filter if provided
    if (email) {
      query = query.where('email', '==', email);
    }
    
    // Execute query
    const snapshot = await query.get();
    
    // Format the data
    const subscribers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json(subscribers);
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' }, 
      { status: 500 }
    );
  }
}

// Add a new subscriber
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the data
    const result = subscriberSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid subscriber data", issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { email, name, status, source } = result.data;
    
    // Check if email already exists
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
    
    // Create new subscriber
    const subscriberData = {
      email,
      subscribedAt: new Date().toISOString(),
      status,
      source: source || 'admin-dashboard',
      ...(name && { name }),
    };
    
    const docRef = await adminDb.collection('newsletter-subscribers').add(subscriberData);
    
    // If status is active, send a welcome email
    if (status === 'active') {
      await sendEmail({
        to: email,
        subject: "Welcome to PocketLawyer Legal Updates",
        template: 'subscription-confirmation',
        data: {
          name: name || email.split('@')[0],
        },
      });
    }
    
    return NextResponse.json({
      id: docRef.id,
      ...subscriberData
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding subscriber:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add subscriber' }, 
      { status: 500 }
    );
  }
}