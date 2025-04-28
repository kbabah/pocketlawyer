import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/utils";

// Get a specific campaign with analytics
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await isAdmin(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const campaignId = params.id;
    
    // Get campaign details
    const campaignDoc = await db.collection('emailCampaigns').doc(campaignId).get();
    if (!campaignDoc.exists) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    const campaign = {
      id: campaignDoc.id,
      ...campaignDoc.data(),
      createdAt: campaignDoc.data()?.createdAt?.toDate().toISOString(),
      scheduledFor: campaignDoc.data()?.scheduledFor?.toDate().toISOString(),
      completedAt: campaignDoc.data()?.completedAt?.toDate().toISOString(),
    };
    
    // Get tracking data for this campaign
    const trackingSnapshot = await db
      .collection('emailTracking')
      .where('campaignId', '==', campaignId)
      .get();
    
    const trackingData = trackingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      sentAt: doc.data().sentAt?.toDate().toISOString(),
      openedAt: doc.data().openedAt?.toDate().toISOString(),
      clickedAt: doc.data().clickedAt?.toDate().toISOString(),
    }));
    
    // Calculate analytics
    const totalEmails = trackingData.length;
    const openedEmails = trackingData.filter(data => data.opened).length;
    const clickedEmails = trackingData.filter(data => data.clicked).length;
    
    // Calculate open and click rates
    const openRate = totalEmails > 0 ? (openedEmails / totalEmails) * 100 : 0;
    const clickRate = totalEmails > 0 ? (clickedEmails / totalEmails) * 100 : 0;
    const clickToOpenRate = openedEmails > 0 ? (clickedEmails / openedEmails) * 100 : 0;
    
    // Aggregate link data
    const linkClicks: Record<string, number> = {};
    trackingData.forEach(data => {
      if (data.links && Array.isArray(data.links)) {
        data.links.forEach((link: { url: string; clicks: number }) => {
          if (!linkClicks[link.url]) {
            linkClicks[link.url] = 0;
          }
          linkClicks[link.url] += link.clicks;
        });
      }
    });
    
    // Format link data for chart
    const topLinks = Object.entries(linkClicks)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
    
    return NextResponse.json({
      campaign,
      analytics: {
        totalEmails,
        openedEmails,
        clickedEmails,
        openRate: parseFloat(openRate.toFixed(2)),
        clickRate: parseFloat(clickRate.toFixed(2)),
        clickToOpenRate: parseFloat(clickToOpenRate.toFixed(2)),
        topLinks
      },
      tracking: trackingData
    });
  } catch (error) {
    console.error(`Failed to fetch campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

// Update campaign
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await isAdmin(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const campaignId = params.id;
    const body = await req.json();
    
    // Get campaign to check status
    const campaignDoc = await db.collection('emailCampaigns').doc(campaignId).get();
    if (!campaignDoc.exists) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    const campaignData = campaignDoc.data();
    
    // Only allow updates if campaign is scheduled
    if (campaignData?.status !== 'scheduled') {
      return NextResponse.json({ 
        error: 'Can only update scheduled campaigns' 
      }, { status: 400 });
    }
    
    // Updatable fields
    const { subject, scheduledFor, data } = body;
    const updateData: Record<string, any> = {};
    
    if (subject) updateData.subject = subject;
    if (data) updateData.data = data;
    
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate <= new Date()) {
        return NextResponse.json({ 
          error: 'Scheduled date must be in the future' 
        }, { status: 400 });
      }
      updateData.scheduledFor = new Date(scheduledFor);
    }
    
    await db.collection('emailCampaigns').doc(campaignId).update(updateData);
    
    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error(`Failed to update campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// Cancel/delete a scheduled campaign
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await isAdmin(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const campaignId = params.id;
    
    // Get campaign to check status
    const campaignDoc = await db.collection('emailCampaigns').doc(campaignId).get();
    if (!campaignDoc.exists) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    
    const campaignData = campaignDoc.data();
    
    // Only allow cancellation if campaign is scheduled
    if (campaignData?.status !== 'scheduled') {
      return NextResponse.json({ 
        error: 'Can only cancel scheduled campaigns' 
      }, { status: 400 });
    }
    
    // Update status to cancelled
    await db.collection('emailCampaigns').doc(campaignId).update({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: session.user.id
    });
    
    return NextResponse.json({
      success: true,
      message: 'Campaign cancelled successfully'
    });
  } catch (error) {
    console.error(`Failed to cancel campaign ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to cancel campaign' }, { status: 500 });
  }
}