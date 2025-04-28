import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const emailId = params.id;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || ''}`, { status: 302 });
  }
  
  // Record link click asynchronously (don't await)
  recordLinkClick(emailId, url).catch(error => {
    console.error(`Failed to record link click for ${emailId}:`, error);
  });

  // Redirect to the original URL
  return NextResponse.redirect(url, { status: 302 });
}

async function recordLinkClick(emailId: string, url: string) {
  try {
    const trackingRef = db.collection('emailTracking').doc(emailId);
    const trackingDoc = await trackingRef.get();
    
    if (!trackingDoc.exists) {
      console.warn(`Tracking data not found for email ID: ${emailId}`);
      return;
    }
    
    const trackingData = trackingDoc.data();
    const now = Timestamp.now();
    
    // Initialize or update links array
    let links = trackingData?.links || [];
    const existingLinkIndex = links.findIndex((link: any) => link.url === url);
    
    if (existingLinkIndex >= 0) {
      // Increment existing link clicks
      links[existingLinkIndex].clicks++;
    } else {
      // Add new link with 1 click
      links.push({ url, clicks: 1 });
    }
    
    // Update tracking data
    await trackingRef.update({
      clicked: true,
      clickCount: FieldValue.increment(1),
      clickedAt: trackingData?.clickedAt || now,
      links: links
    });
    
    // Also record to analytics
    const analyticsRef = db.collection('analytics').doc('emailEvents');
    await analyticsRef.update({
      totalClicks: FieldValue.increment(1),
      [`dailyClicks.${getDateKey()}`]: FieldValue.increment(1)
    });
  } catch (error) {
    console.error('Error recording link click:', error);
    throw error;
  }
}

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}