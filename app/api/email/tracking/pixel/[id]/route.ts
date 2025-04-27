import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

// Transparent 1x1 pixel as base64
const TRANSPARENT_PIXEL = 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const emailId = params.id;
  
  // Record pixel open asynchronously (don't await)
  recordEmailOpen(emailId).catch(error => {
    console.error(`Failed to record email open for ${emailId}:`, error);
  });

  // Return transparent pixel GIF
  return new NextResponse(Buffer.from(TRANSPARENT_PIXEL, 'base64'), {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

async function recordEmailOpen(emailId: string) {
  try {
    const trackingRef = db.collection('emailTracking').doc(emailId);
    const trackingDoc = await trackingRef.get();
    
    if (!trackingDoc.exists) {
      console.warn(`Tracking data not found for email ID: ${emailId}`);
      return;
    }
    
    // Update tracking data
    await trackingRef.update({
      opened: true,
      openCount: FieldValue.increment(1),
      openedAt: trackingDoc.data()?.openedAt || Timestamp.now()
    });
    
    // Also record to analytics
    const analyticsRef = db.collection('analytics').doc('emailEvents');
    await analyticsRef.update({
      totalOpens: FieldValue.increment(1),
      [`dailyOpens.${getDateKey()}`]: FieldValue.increment(1)
    });
  } catch (error) {
    console.error('Error recording email open:', error);
    throw error;
  }
}

function getDateKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}