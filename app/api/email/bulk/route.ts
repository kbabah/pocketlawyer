import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { EmailTemplate } from '../../../../lib/email-service-client';
import { sendBulkEmails } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const { 
      recipients, 
      subject, 
      template, 
      data, 
      campaignId, 
      attachments = [],
      scheduledFor 
    } = params;

    // If scheduled for future, queue the bulk email and return
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      const queuedBulkEmail = {
        recipients,
        subject,
        template,
        data,
        attachments,
        campaignId,
        scheduledFor: Timestamp.fromDate(new Date(scheduledFor)),
        status: 'scheduled',
        createdAt: Timestamp.now()
      };
      
      const docRef = await adminDb.collection('scheduledBulkEmails').add(queuedBulkEmail);
      return NextResponse.json({ 
        success: true, 
        scheduled: true,
        bulkEmailId: docRef.id,
        sent: 0,
        failed: 0
      });
    }

    // Send bulk emails using the email service
    const result = await sendBulkEmails({
      recipients,
      subject,
      template,
      data,
      campaignId,
      attachments
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Bulk email sending failed:', error);
    return NextResponse.json(
      { success: false, error: error.message, sent: 0, failed: -1 }, 
      { status: 500 }
    );
  }
}