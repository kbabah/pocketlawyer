import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

// GET /api/admin/email/scheduled
export async function GET(req: NextRequest) {
  try {
    if (!await isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const snapshot = await db.collection('scheduledEmails')
      .orderBy('scheduledFor', 'desc')
      .get();

    const scheduledEmails = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        to: data.to,
        subject: data.subject,
        template: data.template,
        scheduledFor: data.scheduledFor?.toDate().toISOString(),
        status: data.status,
        createdAt: data.createdAt?.toDate().toISOString()
      };
    });

    return NextResponse.json({ scheduledEmails });
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled emails' }, { status: 500 });
  }
}