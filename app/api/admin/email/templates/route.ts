import { NextRequest, NextResponse } from "next/server";
import { adminDb as db } from "@/lib/firebase-admin";
import { checkAdminPermission } from "@/lib/auth";

// GET /api/admin/email/templates - Get all email templates
export async function GET(req: NextRequest) {
  try {
    // Check admin permissions using the centralized utility
    const adminCheck = await checkAdminPermission(req, { verbose: true });
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
    // Check admin permissions using the centralized utility
    if (!await checkAdminPermission(req)) {
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