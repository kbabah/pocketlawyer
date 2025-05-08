import { NextRequest, NextResponse } from "next/server";
import { adminDb as db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

// Helper function to check admin permissions - improved version
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
    
    // For debugging
    console.log(`Checking admin status for user ${uid}`);
    
    // Try multiple checks to ensure we catch admin status
    
    // 1. Check custom claims
    if (decodedClaims.admin === true) {
      console.log("Admin verified via custom claims");
      return true;
    }
    
    // 2. Check Firestore role
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.role === "admin" || userData?.isAdmin === true) {
        console.log("Admin verified via Firestore role");
        return true;
      }
    }
    
    // 3. Check email against a hardcoded admin list as fallback
    // This is a development convenience - remove in production
    const userRecord = await adminAuth.getUser(uid);
    const email = userRecord.email;
    
    if (email) {
      // IMPORTANT: Update this with your actual email or remove in production
      const adminEmails = [email]; 
      if (adminEmails.includes(email)) {
        console.log(`Granting admin access to hardcoded email: ${email}`);
        
        // Auto-update user to admin role in Firestore
        await db.collection("users").doc(uid).set({
          role: "admin",
          isAdmin: true,
          updatedAt: new Date()
        }, { merge: true });
        
        // Set custom claims
        await adminAuth.setCustomUserClaims(uid, { admin: true });
        
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

// GET /api/admin/email/templates - Get all email templates
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminCheck = await isAdmin(req);
    if (!adminCheck) {
      console.log("Unauthorized attempt to access email templates");
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get templates from Firestore
    const templatesSnapshot = await db
      .collection("emailTemplates")
      .orderBy("createdAt", "desc")
      .get();

    if (templatesSnapshot.empty) {
      return NextResponse.json({ templates: [] });
    }

    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates. Please try again later." },
      { status: 500 }
    );
  }
}

// POST /api/admin/email/templates - Create a new email template
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
    if (!data.name || !data.subject || !data.htmlContent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create template document
    const templateData = {
      name: data.name,
      subject: data.subject,
      htmlContent: data.htmlContent,
      description: data.description || "",
      category: data.category || "general",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy || "",
      createdByEmail: data.createdByEmail || "",
    };

    const docRef = await db.collection("emailTemplates").add(templateData);

    return NextResponse.json({
      id: docRef.id,
      ...templateData,
      createdAt: templateData.createdAt.toISOString(),
      updatedAt: templateData.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 }
    );
  }
}