import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email-service';
import * as z from 'zod';

// Schema for email validation
const subscribeSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the email
    const result = subscribeSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Check if email already exists
    const existingSubscriber = await adminDb
      .collection('newsletter-subscribers')
      .where('email', '==', email)
      .get();
      
    if (!existingSubscriber.empty) {
      return NextResponse.json(
        { message: "You're already subscribed to our newsletter" },
        { status: 200 }
      );
    }
    
    // Add the new subscriber
    await adminDb.collection('newsletter-subscribers').add({
      email,
      subscribedAt: new Date().toISOString(),
      status: 'active',
    });
    
    // Send confirmation email to the subscriber
    await sendEmail({
      to: email,
      subject: "Welcome to PocketLawyer Legal Updates",
      template: 'subscription-confirmation',
      data: {
        name: email.split('@')[0], // Use the part before @ as a name
      },
      trackingEnabled: true,
    });
    
    return NextResponse.json(
      { message: "Successfully subscribed to the newsletter" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}