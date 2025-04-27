import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { adminDb } from '../../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { EmailTemplate } from '../../../../lib/email-service-client';

// Configure AWS SES
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const ses = new AWS.SES();

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

    // For immediate sending, we'll call the send API for each recipient
    // This approach allows for personalization and better tracking
    const results = await Promise.allSettled(
      recipients.map(async (recipient: { email: string; name?: string }) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipient.email,
            subject,
            template,
            data: {
              ...data,
              name: recipient.name || '',
              email: recipient.email
            },
            attachments,
            trackingEnabled: true,
            campaignId
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to send email to ${recipient.email}`);
        }
        
        return await response.json();
      })
    );
    
    // Count successes and failures
    const sent = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    // Save campaign statistics if campaignId is provided
    if (campaignId) {
      await adminDb.collection('emailCampaigns').doc(campaignId).update({
        sentCount: sent,
        failedCount: failed,
        completedAt: Timestamp.now(),
        status: 'completed'
      });
    }

    return NextResponse.json({
      success: true,
      sent,
      failed
    });
  } catch (error: any) {
    console.error('Bulk email sending failed:', error);
    return NextResponse.json(
      { success: false, error: error.message, sent: 0, failed: -1 }, 
      { status: 500 }
    );
  }
}