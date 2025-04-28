import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    // Get email from request
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }
    
    // Debug environment variables
    console.log("Email Service Environment Check:");
    console.log(`AWS_REGION=${process.env.AWS_REGION}`);
    console.log(`EMAIL_FROM=${process.env.EMAIL_FROM}`);
    console.log(`AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID?.substring(0, 5)}...`); // Log only part of sensitive data
    console.log(`AWS_SECRET_ACCESS_KEY exists: ${!!process.env.AWS_SECRET_ACCESS_KEY}`);
    
    // Try to send a test email
    const result = await sendEmail({
      to: email,
      subject: "PocketLawyer Email Test",
      template: "welcome",
      data: { name: "Test User" }
    });
    
    if (!result.success) {
      console.error("Test email failed:", result.error);
      return NextResponse.json(
        { success: false, message: "Failed to send test email", error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      messageId: result.messageId
    });
  } catch (error) {
    console.error("Error in email test route:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error },
      { status: 500 }
    );
  }
}