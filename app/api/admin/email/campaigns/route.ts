import { NextRequest, NextResponse } from "next/server";
import { adminDb as db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

// Helper function to check admin permissions - reusing from templates API
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

// GET /api/admin/email/campaigns - Get all email campaigns
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    
    const campaignsSnapshot = await db
      .collection("emailCampaigns")
      .orderBy("createdAt", "desc")
      .get();

    if (campaignsSnapshot.empty) {
      return NextResponse.json({ campaigns: [] });
    }

    const campaigns = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      scheduledFor: doc.data().scheduledFor?.toDate().toISOString(),
      sentAt: doc.data().sentAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching email campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch email campaigns" },
      { status: 500 }
    );
  }
}

// POST /api/admin/email/campaigns - Create a new email campaign
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.subject || !data.templateId || !data.recipients) {
      return NextResponse.json(
        { error: "Missing required fields", message: "Please provide all required campaign details." },
        { status: 400 }
      );
    }
    
    // Get user information for tracking purposes
    const sessionCookie = cookies().get("firebase-session")?.value;
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
    const uid = decodedClaims.uid;
    const userInfo = await adminAuth.getUser(uid);
    
    // Handle recipient processing based on type
    let recipientData = data.recipients;
    let estimatedRecipientCount = 0;
    
    if (data.recipients.type === "all") {
      const usersSnapshot = await db.collection("users").count().get();
      estimatedRecipientCount = usersSnapshot.data().count;
    } 
    else if (data.recipients.type === "segment" && data.recipients.segment) {
      // Different logic based on segment - similar to the count endpoint
      const segment = data.recipients.segment;
      let query;
      
      switch (segment) {
        case 'active': {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const snapshot = await db.collection("users")
            .where("lastActive", ">=", thirtyDaysAgo)
            .count().get();
          estimatedRecipientCount = snapshot.data().count;
          break;
        }
        case 'inactive': {
          const inactiveDate = new Date();
          inactiveDate.setDate(inactiveDate.getDate() - 30);
          const snapshot = await db.collection("users")
            .where("lastActive", "<", inactiveDate)
            .count().get();
          estimatedRecipientCount = snapshot.data().count;
          break;
        }
        case 'trial': {
          const snapshot = await db.collection("users")
            .where("subscriptionTier", "==", "trial")
            .count().get();
          estimatedRecipientCount = snapshot.data().count;
          break;
        }
        case 'premium': {
          const snapshot = await db.collection("users")
            .where("subscriptionTier", "==", "premium")
            .count().get();
          estimatedRecipientCount = snapshot.data().count;
          break;
        }
        case 'new': {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const snapshot = await db.collection("users")
            .where("createdAt", ">=", sevenDaysAgo)
            .count().get();
          estimatedRecipientCount = snapshot.data().count;
          break;
        }
        default: {
          const snapshot = await db.collection("users").count().get();
          estimatedRecipientCount = snapshot.data().count;
        }
      }
    } 
    else if (data.recipients.type === "custom" && Array.isArray(data.recipients.emails)) {
      estimatedRecipientCount = data.recipients.emails.length;
    } 
    else if (data.recipients.type === "file" && data.recipients.fileName) {
      // Find the uploaded recipient list by filename
      const recipientListsQuery = await db.collection("emailRecipientLists")
        .orderBy("uploadedAt", "desc")
        .limit(1)
        .get();
        
      if (!recipientListsQuery.empty) {
        const listData = recipientListsQuery.docs[0].data();
        estimatedRecipientCount = listData.totalCount || 0;
        recipientData.listId = recipientListsQuery.docs[0].id;
      }
    }
    
    // Create campaign document with a scheduled status
    const now = new Date();
    let scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : now;
    const status = scheduledFor > now ? "scheduled" : "pending";
    
    const campaignData = {
      name: data.name,
      subject: data.subject,
      templateId: data.templateId,
      recipients: recipientData,
      estimatedRecipientCount,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      status,
      createdAt: now,
      updatedAt: now,
      scheduledFor: scheduledFor,
      createdBy: uid,
      createdByName: userInfo.displayName || "",
      createdByEmail: userInfo.email || "",
    };

    const campaignRef = await db.collection("emailCampaigns").add(campaignData);

    // If scheduled for now or in the past, trigger the sending process
    // In a real app, this would likely create a background job
    if (status === "pending") {
      // Update the campaign to reflect that processing has begun
      await campaignRef.update({
        status: "processing",
        updatedAt: new Date()
      });
      
      // Here you would trigger your email sending process
      // For now, we'll just simulate success
      console.log(`Campaign ${campaignRef.id} created and ready for sending`);
    }

    return NextResponse.json({
      id: campaignRef.id,
      ...campaignData,
      createdAt: campaignData.createdAt.toISOString(),
      updatedAt: campaignData.updatedAt.toISOString(),
      scheduledFor: campaignData.scheduledFor.toISOString(),
    });
  } catch (error) {
    console.error("Error creating email campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}