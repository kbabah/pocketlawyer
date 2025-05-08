import { NextRequest, NextResponse } from "next/server";
import { adminDb as db } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { v4 as uuidv4 } from "uuid";

// Helper function to check admin permissions
async function isAdmin(req: NextRequest) {
  try {
    // Attempt to get the Firebase session
    const sessionCookie = cookies().get("firebase-session")?.value;
    
    if (!sessionCookie) {
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

// POST /api/admin/email/recipients/upload - Upload recipient file
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    if (!await isAdmin(req)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Check file type (simple check based on extension)
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload a CSV or Excel file." },
        { status: 400 }
      );
    }
    
    // Process the file to extract emails
    // For CSV files, we'll do a simple string parsing
    // For Excel files, we would need a library like exceljs, but for simplicity,
    // we'll assume it's a CSV file in this example
    let validEmails: string[] = [];
    
    try {
      const fileContent = await file.text();
      
      if (fileName.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = fileContent.split(/[\r\n]+/).filter(line => line.trim());
        const headers = lines[0].toLowerCase().split(',');
        
        // Find email column index
        const emailColumnIndex = headers.findIndex(header => 
          header.includes('email') || header === 'e-mail' || header === 'mail'
        );
        
        if (emailColumnIndex === -1) {
          throw new Error("Email column not found in CSV file");
        }
        
        // Extract emails from each row
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(',');
          if (columns.length > emailColumnIndex) {
            const email = columns[emailColumnIndex].trim();
            if (isValidEmail(email)) {
              validEmails.push(email);
            }
          }
        }
      } else {
        // For Excel files, we would need proper parsing
        // This is a placeholder for demonstration
        // In a real implementation, you would use a library like exceljs
        throw new Error("Excel file parsing not implemented");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      return NextResponse.json(
        { error: "Failed to process file: " + (error instanceof Error ? error.message : "Unknown error") },
        { status: 500 }
      );
    }
    
    // Store the extracted emails in Firestore for later use
    const recipientListId = uuidv4();
    await db.collection("emailRecipientLists").doc(recipientListId).set({
      fileName: file.name,
      uploadedAt: new Date(),
      validEmails,
      totalCount: validEmails.length
    });
    
    return NextResponse.json({
      success: true,
      validEmails: validEmails.length,
      recipientListId
    });
  } catch (error) {
    console.error("Error uploading recipient file:", error);
    return NextResponse.json(
      { error: "Failed to upload recipient file" },
      { status: 500 }
    );
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}