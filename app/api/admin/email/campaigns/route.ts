import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { sendBulkEmails, EmailTemplate, EmailAttachment } from "@/lib/email-service";
import { isAdmin } from "@/lib/utils";
import { Timestamp } from "firebase-admin/firestore";

// Get all email campaigns
export async function GET(req: Request) {
  try {
    const session = await isAdmin(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query = db.collection('emailCampaigns')
      .orderBy('createdAt', 'desc')
      .limit(limit);
      
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      scheduledFor: doc.data().scheduledFor?.toDate().toISOString(),
      completedAt: doc.data().completedAt?.toDate().toISOString(),
    }));
    
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

// Create new email campaign
export async function POST(req: Request) {
  try {
    const session = await isAdmin(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      subject,
      template,
      recipients,
      data,
      scheduledFor,
      attachmentUrls = []
    } = body;
    
    // Validate required fields
    if (!name || !subject || !template || !recipients || recipients.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    let attachments: EmailAttachment[] = [];
    
    // Process attachments if any
    if (attachmentUrls.length > 0) {
      // This would involve fetching files from storage, converting to buffers
      // Implementation depends on your storage solution
      // Example placeholder:
      /*
      attachments = await Promise.all(
        attachmentUrls.map(async (url) => {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          return {
            filename: url.split('/').pop() || 'attachment',
            content: Buffer.from(buffer),
            contentType: response.headers.get('content-type') || 'application/octet-stream'
          };
        })
      );
      */
    }
    
    // Generate campaign ID
    const campaignId = db.collection('emailCampaigns').doc().id;
    
    // If scheduled for future, create scheduled campaign
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      
      if (scheduledDate > new Date()) {
        await db.collection('emailCampaigns').doc(campaignId).set({
          name,
          subject,
          template,
          recipients,
          data,
          attachments, // Store any attachments
          status: 'scheduled',
          createdAt: Timestamp.now(),
          scheduledFor: Timestamp.fromDate(scheduledDate),
          createdBy: session.user.id,
          totalCount: recipients.length,
          sentCount: 0,
          failedCount: 0
        });
        
        return NextResponse.json({
          success: true,
          message: 'Campaign scheduled successfully',
          campaignId,
          scheduledFor: scheduledDate.toISOString()
        });
      }
    }
    
    // Otherwise, send immediately
    const result = await sendBulkEmails({
      recipients,
      subject,
      template: template as EmailTemplate,
      data,
      campaignId,
      attachments
    });
    
    // Store campaign record
    await db.collection('emailCampaigns').doc(campaignId).set({
      name,
      subject,
      template,
      recipients,
      data,
      status: 'completed',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      createdBy: session.user.id,
      totalCount: recipients.length,
      sentCount: result.sent,
      failedCount: result.failed
    });
    
    return NextResponse.json({
      success: result.success,
      campaignId,
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ 
      error: 'Failed to create campaign',
      details: String(error)
    }, { status: 500 });
  }
}