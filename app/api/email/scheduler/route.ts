import { NextResponse } from "next/server";
import { processScheduledEmails, processScheduledCampaigns } from "@/lib/email-service";
import { verifyApiKey } from "@/lib/utils";

/**
 * This endpoint is meant to be called by a cron job service (like Vercel Cron)
 * to process scheduled emails and campaigns
 */
export async function POST(req: Request) {
  try {
    // Verify API key for security
    const apiKey = req.headers.get('x-api-key');
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Process scheduled individual emails
    const emailsResult = await processScheduledEmails();
    
    // Process scheduled campaigns
    const campaignsResult = await processScheduledCampaigns();
    
    return NextResponse.json({
      success: true,
      emails: emailsResult,
      campaigns: campaignsResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}