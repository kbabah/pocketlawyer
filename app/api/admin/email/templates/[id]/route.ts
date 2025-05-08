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
    
    console.log(`Checking admin status for user ${uid}`);
    
    // Check custom claims
    if (decodedClaims.admin === true) {
      console.log("Admin verified via custom claims");
      return true;
    }
    
    // Check Firestore role
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        console.log("Admin verified via Firestore role");
        return true;
      }
    }
    
    console.log("User is not an admin");
    return false;
    
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// GET /api/admin/email/templates/[id] - Get a specific email template by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = params.id;
    
    // Check admin permissions
    if (!await isAdmin(req)) {
      console.log(`Unauthorized attempt to access template ${templateId}`);
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get the template from Firestore
    const templateDoc = await db.collection("emailTemplates").doc(templateId).get();
    
    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const template = {
      id: templateDoc.id,
      ...templateDoc.data(),
      createdAt: templateDoc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: templateDoc.data()?.updatedAt?.toDate().toISOString(),
    };

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching email template:", error);
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/email/templates/[id] - Update an existing email template
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = params.id;
    
    // Check admin permissions
    if (!await isAdmin(req)) {
      console.log(`Unauthorized attempt to update template ${templateId}`);
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get the template document
    const templateDoc = await db.collection("emailTemplates").doc(templateId).get();
    
    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.subject || !data.htmlContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get user info for tracking
    const sessionCookie = cookies().get("firebase-session")?.value;
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
    const uid = decodedClaims.uid;
    const userInfo = await adminAuth.getUser(uid);

    // Update the template
    const templateData = {
      name: data.name,
      subject: data.subject,
      htmlContent: data.htmlContent,
      description: data.description || templateDoc.data()?.description || "",
      type: data.type || templateDoc.data()?.type || "custom",
      updatedAt: new Date(),
      updatedBy: uid,
      updatedByEmail: userInfo.email || "",
    };

    await db.collection("emailTemplates").doc(templateId).update(templateData);

    return NextResponse.json({
      id: templateId,
      ...templateData,
      createdAt: templateDoc.data()?.createdAt?.toDate().toISOString(),
      updatedAt: templateData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/email/templates/[id] - Delete an email template
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const templateId = params.id;
    
    // Check admin permissions
    console.log(`Attempting to delete template ${templateId}`);
    const adminStatus = await isAdmin(req);
    
    if (!adminStatus) {
      console.log(`Unauthorized attempt to delete template ${templateId}`);
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    
    console.log(`Admin verified, proceeding with template deletion: ${templateId}`);

    // Check if template exists
    const templateDoc = await db.collection("emailTemplates").doc(templateId).get();
    
    if (!templateDoc.exists) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }
    
    // Check if the template is being used in any active campaigns
    const campaignsSnapshot = await db.collection("emailCampaigns")
      .where("templateId", "==", templateId)
      .where("status", "in", ["scheduled", "pending", "processing"])
      .limit(1)
      .get();
    
    if (!campaignsSnapshot.empty) {
      return NextResponse.json(
        { 
          error: "Cannot delete template", 
          message: "This template is being used in active or scheduled campaigns" 
        },
        { status: 400 }
      );
    }

    // Delete the template
    await db.collection("emailTemplates").doc(templateId).delete();
    console.log(`Template ${templateId} deleted successfully`);

    return NextResponse.json({ 
      success: true,
      message: "Template deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { error: "Failed to delete email template", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}