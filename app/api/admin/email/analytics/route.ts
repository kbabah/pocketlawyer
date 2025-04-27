import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await isAdmin(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30days'; // '7days', '30days', '90days', 'alltime'
    
    // Calculate date ranges
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'alltime':
        startDate = new Date(2020, 0, 1); // Far in the past
        break;
    }
    
    // Get all emails in date range
    const emailsSnapshot = await db
      .collection('emailTracking')
      .where('sentAt', '>=', startDate)
      .get();
    
    const emails = emailsSnapshot.docs.map(doc => doc.data());
    
    // Get all campaigns in date range
    const campaignsSnapshot = await db
      .collection('emailCampaigns')
      .where('createdAt', '>=', startDate)
      .get();
      
    const campaigns = campaignsSnapshot.docs.map(doc => doc.data());
    
    // Calculate summary metrics
    const totalEmails = emails.length;
    const totalOpened = emails.filter(email => email.opened).length;
    const totalClicked = emails.filter(email => email.clicked).length;
    const totalCampaigns = campaigns.length;
    
    // Calculate daily metrics for charts
    const dailyData = calculateDailyMetrics(emails, startDate);
    
    // Calculate template performance
    const templatePerformance = calculateTemplatePerformance(emails);
    
    // Calculate campaign performance
    const campaignPerformance = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      totalSent: campaign.totalCount || 0,
      delivered: campaign.sentCount || 0,
      failed: campaign.failedCount || 0,
      template: campaign.template
    })).sort((a, b) => b.totalSent - a.totalSent).slice(0, 10);

    return NextResponse.json({
      summary: {
        totalEmails,
        totalOpened,
        totalClicked,
        totalCampaigns,
        openRate: totalEmails > 0 ? (totalOpened / totalEmails) * 100 : 0,
        clickRate: totalEmails > 0 ? (totalClicked / totalEmails) * 100 : 0,
        clickToOpenRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      },
      dailyData,
      templatePerformance,
      campaignPerformance
    });
  } catch (error) {
    console.error('Failed to fetch email analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function calculateDailyMetrics(emails: any[], startDate: Date) {
  const dailyData: Record<string, { sent: number, opened: number, clicked: number }> = {};
  
  // Initialize all days in range
  const dateRangeEnd = new Date();
  for (let d = new Date(startDate); d <= dateRangeEnd; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDate(d);
    dailyData[dateKey] = { sent: 0, opened: 0, clicked: 0 };
  }
  
  // Populate with actual data
  emails.forEach(email => {
    if (!email.sentAt) return;
    
    const sentDate = formatDate(email.sentAt.toDate());
    
    if (dailyData[sentDate]) {
      dailyData[sentDate].sent++;
      
      if (email.opened) {
        dailyData[sentDate].opened++;
      }
      
      if (email.clicked) {
        dailyData[sentDate].clicked++;
      }
    }
  });
  
  // Convert to array for charting
  return Object.entries(dailyData).map(([date, metrics]) => ({
    date,
    ...metrics
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateTemplatePerformance(emails: any[]) {
  const templates: Record<string, { total: number, opened: number, clicked: number }> = {};
  
  emails.forEach(email => {
    const template = email.template || 'unknown';
    
    if (!templates[template]) {
      templates[template] = { total: 0, opened: 0, clicked: 0 };
    }
    
    templates[template].total++;
    
    if (email.opened) {
      templates[template].opened++;
    }
    
    if (email.clicked) {
      templates[template].clicked++;
    }
  });
  
  return Object.entries(templates).map(([template, metrics]) => ({
    template,
    totalSent: metrics.total,
    openRate: metrics.total > 0 ? (metrics.opened / metrics.total) * 100 : 0,
    clickRate: metrics.total > 0 ? (metrics.clicked / metrics.total) * 100 : 0
  })).sort((a, b) => b.totalSent - a.totalSent);
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}