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

// GET /api/admin/email/campaigns/[id] - Get a specific email campaign by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;
    
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the campaign from Firestore
    const campaignDoc = await db.collection("emailCampaigns").doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaignData = campaignDoc.data();
    
    // Fetch template information if available
    let templateData = null;
    if (campaignData?.templateId) {
      const templateDoc = await db.collection("emailTemplates").doc(campaignData.templateId).get();
      if (templateDoc.exists) {
        templateData = {
          id: templateDoc.id,
          name: templateDoc.data()?.name || "Unknown Template",
        };
      }
    }
    
    // Fetch email events related to this campaign
    const eventsSnapshot = await db.collection("emailEvents")
      .where("campaignId", "==", campaignId)
      .limit(100) // Limit to prevent too large responses
      .get();

    // Process events to build recipient-level statistics
    const recipientStats = new Map();
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const recipientEmail = event.recipientEmail;
      
      if (!recipientEmail) return;
      
      if (!recipientStats.has(recipientEmail)) {
        recipientStats.set(recipientEmail, {
          email: recipientEmail,
          name: event.recipientName || "",
          events: []
        });
      }
      
      // Add event to recipient's history
      recipientStats.get(recipientEmail).events.push({
        type: event.type,
        timestamp: event.timestamp?.toDate?.() ? event.timestamp.toDate().toISOString() : null,
        metadata: event.metadata || {}
      });
    });
    
    // Convert recipient stats to array and calculate derived metrics
    const recipients = Array.from(recipientStats.values()).map(recipient => {
      const sent = recipient.events.find(e => e.type === "sent");
      const opened = recipient.events.find(e => e.type === "open");
      const clicked = recipient.events.filter(e => e.type === "click");
      const bounced = recipient.events.find(e => e.type === "bounce");
      
      return {
        email: recipient.email,
        name: recipient.name,
        sent: Boolean(sent),
        sentAt: sent?.timestamp || null,
        opened: Boolean(opened),
        openedAt: opened?.timestamp || null,
        clicked: clicked.length > 0,
        clickedAt: clicked.length > 0 ? clicked[0].timestamp : null,
        clickCount: clicked.length,
        clicks: clicked.map(c => ({
          url: c.metadata?.url || "",
          timestamp: c.timestamp
        })),
        bounced: Boolean(bounced),
        bouncedAt: bounced?.timestamp || null,
        bounceReason: bounced?.metadata?.reason || null
      };
    });
    
    // Build campaign details with aggregated stats
    const sentCount = recipients.filter(r => r.sent).length;
    const openCount = recipients.filter(r => r.opened).length;
    const clickCount = recipients.filter(r => r.clicked).length;
    const bounceCount = recipients.filter(r => r.bounced).length;
    
    // Find most clicked links
    const allClicks = recipients.flatMap(r => r.clicks || []);
    const linkCounts = allClicks.reduce((acc, click) => {
      const url = click.url;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {});
    
    const popularLinks = Object.entries(linkCounts)
      .map(([url, count]) => ({ url, clicks: count as number }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5); // Top 5 links
    
    // Format the response
    const campaign = {
      id: campaignDoc.id,
      name: campaignData?.name || "",
      subject: campaignData?.subject || "",
      templateId: campaignData?.templateId || "",
      templateName: templateData?.name || "Unknown Template",
      status: campaignData?.status || "unknown",
      createdAt: campaignData?.createdAt?.toDate?.() ? campaignData.createdAt.toDate().toISOString() : null,
      scheduledFor: campaignData?.scheduledFor?.toDate?.() ? campaignData.scheduledFor.toDate().toISOString() : null,
      sentAt: campaignData?.sentAt?.toDate?.() ? campaignData.sentAt.toDate().toISOString() : null,
      stats: {
        recipientCount: campaignData?.estimatedRecipientCount || 0,
        sent: sentCount,
        opened: openCount,
        clicked: clickCount,
        bounced: bounceCount,
        openRate: sentCount > 0 ? (openCount / sentCount * 100).toFixed(1) : "0.0",
        clickRate: openCount > 0 ? (clickCount / openCount * 100).toFixed(1) : "0.0",
        bounceRate: sentCount > 0 ? (bounceCount / sentCount * 100).toFixed(1) : "0.0",
      },
      popularLinks,
      recipients: recipients.slice(0, 100) // Limit to 100 recipients for performance
    };

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign details" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/email/campaigns/[id] - Delete an email campaign
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id;
    
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get the campaign to check if it can be deleted
    const campaignDoc = await db.collection("emailCampaigns").doc(campaignId).get();
    
    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    const campaignData = campaignDoc.data();
    
    // Only allow deleting campaigns that haven't been sent yet or are in draft state
    if (campaignData?.status && !["draft", "scheduled", "cancelled"].includes(campaignData.status)) {
      return NextResponse.json(
        { 
          error: "Cannot delete campaign", 
          message: "Only draft, scheduled, or cancelled campaigns can be deleted" 
        },
        { status: 400 }
      );
    }

    // Delete the campaign
    await db.collection("emailCampaigns").doc(campaignId).delete();

    return NextResponse.json({ 
      success: true,
      message: "Campaign deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}