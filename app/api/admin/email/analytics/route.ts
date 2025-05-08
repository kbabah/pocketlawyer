import { NextRequest, NextResponse } from "next/server";
import { adminDb as db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

// Helper function to check admin permissions
async function isAdmin(req: NextRequest) {
  try {
    // Attempt to get the Firebase session
    const sessionCookie = cookies().get("firebase-session")?.value;
    
    if (!sessionCookie) {
      console.log("No session cookie found");
      return false;
    }
    
    // Verify the session
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Check custom claims
    if (decodedClaims.admin === true) {
      return true;
    }
    
    // Check Firestore role
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// GET /api/admin/email/analytics - Get email analytics data
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the period from the URL if present
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // Default to month
    
    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    // Fetch campaign and email data for analytics
    const campaignsSnapshot = await db.collection("emailCampaigns")
      .where("createdAt", ">=", startDate)
      .get();
      
    // Calculate metrics
    const totalCampaigns = campaignsSnapshot.size;
    let totalRecipients = 0;
    let totalSent = 0;
    let totalOpens = 0;
    let totalClicks = 0;
    let totalBounces = 0;
    
    // Process each campaign
    campaignsSnapshot.forEach(doc => {
      const campaign = doc.data();
      totalRecipients += campaign.estimatedRecipientCount || 0;
      totalSent += campaign.sentCount || 0;
      totalOpens += campaign.openCount || 0;
      totalClicks += campaign.clickCount || 0;
      totalBounces += campaign.bounceCount || 0;
    });
    
    // Calculate engagement rates
    const openRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const clickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;
    
    // Fetch template usage data
    const templatesSnapshot = await db.collection("emailTemplates").get();
    const templateUsage = [] as { id: string, name: string, usageCount: number }[];
    
    templatesSnapshot.forEach(doc => {
      const template = doc.data();
      templateUsage.push({
        id: doc.id,
        name: template.name || 'Unnamed Template',
        usageCount: template.usageCount || 0
      });
    });
    
    // Sort by usage count, descending
    templateUsage.sort((a, b) => b.usageCount - a.usageCount);
    
    // Generate time series data for email activity
    const timeSeriesData = [] as { date: string, sent: number, opens: number, clicks: number }[];
    
    // Create a map for dates
    const dateMap = new Map<string, { sent: number, opens: number, clicks: number }>();
    
    // Determine interval and format based on period
    let dateFormat: 'day' | 'week' | 'month' = 'day';
    if (period === 'year') {
      dateFormat = 'month';
    } else if (period === 'quarter') {
      dateFormat = 'week';
    }
    
    // Initialize dateMap with zero values for all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      let dateKey: string;
      
      if (dateFormat === 'day') {
        dateKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (dateFormat === 'week') {
        // Start of the week (Sunday)
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else { // month
        dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      dateMap.set(dateKey, { sent: 0, opens: 0, clicks: 0 });
      
      // Move to next interval
      if (dateFormat === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (dateFormat === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else { // month
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Populate with actual data from emailEvents collection
    const emailEventsSnapshot = await db.collection("emailEvents")
      .where("timestamp", ">=", startDate)
      .get();
      
    emailEventsSnapshot.forEach(doc => {
      const event = doc.data();
      if (!event.timestamp) return;
      
      const eventDate = event.timestamp.toDate();
      let dateKey: string;
      
      if (dateFormat === 'day') {
        dateKey = eventDate.toISOString().split('T')[0];
      } else if (dateFormat === 'week') {
        const weekStart = new Date(eventDate);
        weekStart.setDate(eventDate.getDate() - eventDate.getDay());
        dateKey = weekStart.toISOString().split('T')[0];
      } else { // month
        dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      // Update counts based on event type
      const dateData = dateMap.get(dateKey);
      if (dateData) {
        if (event.type === 'sent') dateData.sent += 1;
        else if (event.type === 'open') dateData.opens += 1;
        else if (event.type === 'click') dateData.clicks += 1;
      }
    });
    
    // Convert map to array
    dateMap.forEach((value, key) => {
      timeSeriesData.push({
        date: key,
        sent: value.sent,
        opens: value.opens,
        clicks: value.clicks
      });
    });
    
    // Sort by date
    timeSeriesData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Prepare the analytics response
    const analytics = {
      period,
      summary: {
        totalCampaigns,
        totalRecipients,
        totalSent,
        totalOpens,
        totalClicks,
        totalBounces,
        openRate: parseFloat(openRate.toFixed(2)),
        clickRate: parseFloat(clickRate.toFixed(2)),
        bounceRate: parseFloat(bounceRate.toFixed(2)),
      },
      templateUsage: templateUsage.slice(0, 5), // Top 5 templates
      timeSeriesData,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching email analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}