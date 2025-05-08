import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }
    
    // Debug environment variables
    console.log("Email Service Environment Check:");
    console.log(`POSTMARK_SERVER_TOKEN exists: ${!!process.env.POSTMARK_SERVER_TOKEN}`);
    console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);
    
    // Try to send a test email
    const result = await sendEmail({
      to: email,
      subject: "PocketLawyer Postmark Test",
      template: "custom",
      data: { 
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="padding: 20px; text-align: center; background-color: #f8f9fa;">
              <h1>Test Email from PocketLawyer</h1>
            </div>
            <div style="padding: 20px;">
              <p>This is a test email sent using Postmark.</p>
              <p>If you're seeing this email, the Postmark integration is working correctly!</p>
            </div>
          </div>
        `
      }
    });
    
    if (!result.success) {
      console.error("Test email failed:", result.error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to send test email", 
          error: result.error 
        },
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