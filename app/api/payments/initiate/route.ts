import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/api-auth";
import { isPaymentsEnabled } from "@/lib/payments-config";
import {
  formatPhoneNumber,
  isValidCameroonPhone,
  requestProviderPayment,
} from "@/lib/server/payment-gateway";
import type { PaymentMethod } from "@/lib/services/payment-service";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  if (!isPaymentsEnabled()) {
    return NextResponse.json(
      { error: "Payments are not enabled" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const {
      bookingId,
      amount,
      currency = "XAF",
      method,
      phoneNumber,
      description,
    } = body;

    if (!bookingId || !amount || !method || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }

    if (!isValidCameroonPhone(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const bookingSnap = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingSnap.data()!;
    if (booking.userId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const paymentRef = adminDb.collection("payments").doc();
    const formattedPhone = formatPhoneNumber(phoneNumber);

    const providerResult = await requestProviderPayment({
      paymentId: paymentRef.id,
      bookingId,
      amount: Number(amount),
      currency,
      method: method as PaymentMethod,
      phoneNumber: formattedPhone,
      description: description || `Booking ${bookingId}`,
    });

    await paymentRef.set({
      bookingId,
      userId: authResult.user.uid,
      amount: Number(amount),
      currency,
      method,
      phoneNumber: formattedPhone,
      status: providerResult.success ? "processing" : "failed",
      transactionId: providerResult.transactionId || null,
      message: providerResult.message,
      description: description || "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection("bookings").doc(bookingId).update({
      paymentStatus: providerResult.success ? "pending" : "failed",
      paymentId: paymentRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: providerResult.success,
      message: providerResult.message,
      paymentId: paymentRef.id,
      transactionId: providerResult.transactionId,
    });
  } catch (error) {
    console.error("Payment initiate error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
