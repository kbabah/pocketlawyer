import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  sendBookingConfirmation,
  sendLawyerBookingNotification,
} from "@/lib/email";
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

async function assertBookingAccess(
  bookingId: string,
  uid: string,
  emailType: "booking-confirmation" | "lawyer-notification"
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const snap = await adminDb.collection("bookings").doc(bookingId).get();
  if (!snap.exists) {
    return { ok: false, status: 404, error: "Booking not found" };
  }

  const booking = snap.data()!;
  if (booking.userId === uid) {
    return { ok: true };
  }

  const lawyersSnap = await adminDb
    .collection("lawyers")
    .where("userId", "==", uid)
    .limit(1)
    .get();

  const isLawyerForBooking =
    !lawyersSnap.empty && lawyersSnap.docs[0].id === booking.lawyerId;

  if (emailType === "lawyer-notification" && isLawyerForBooking) {
    return { ok: true };
  }

  return { ok: false, status: 403, error: "Forbidden" };
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const { type, bookingId, ...data } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    let result = false;

    switch (type) {
      case "booking-confirmation": {
        const access = await assertBookingAccess(
          bookingId,
          authUser.uid,
          "booking-confirmation"
        );
        if (!access.ok) {
          return NextResponse.json(
            { error: access.error },
            { status: access.status }
          );
        }
        result = await sendBookingConfirmation({ ...data, bookingId });
        break;
      }

      case "lawyer-notification": {
        const access = await assertBookingAccess(
          bookingId,
          authUser.uid,
          "lawyer-notification"
        );
        if (!access.ok) {
          return NextResponse.json(
            { error: access.error },
            { status: access.status }
          );
        }
        result = await sendLawyerBookingNotification({ ...data, bookingId });
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: result });
  } catch (error: unknown) {
    console.error("Email API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
