import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// GET /api/admin/email/sent
export async function GET(req: NextRequest) {
  try {
    if (!await isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const snapshot = await db.collection('emailTracking')
      .orderBy('sentAt', 'desc')
      .limit(100)
      .get();

    const sentEmails = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        recipient: data.recipient,
        subject: data.subject,
        template: data.template,
        campaignId: data.campaignId || null,
        sentAt: data.sentAt?.toDate().toISOString(),
        opened: data.opened || false,
        openCount: data.openCount || 0,
        clicked: data.clicked || false,
        clickCount: data.clickCount || 0,
      };
    });

    return NextResponse.json({ sentEmails });
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    return NextResponse.json({ error: 'Failed to fetch sent emails' }, { status: 500 });
  }
}