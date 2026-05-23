import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/api-auth";
import { pollProviderPaymentStatus } from "@/lib/server/payment-gateway";
import type { PaymentMethod, PaymentStatus } from "@/lib/services/payment-service";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const paymentRef = adminDb.collection("payments").doc(paymentId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const payment = paymentSnap.data()!;
    if (payment.userId !== authResult.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payment.status === "completed") {
      return NextResponse.json({
        success: true,
        status: "completed",
        message: "Payment completed successfully",
      });
    }

    let status: PaymentStatus = payment.status;
    if (payment.transactionId) {
      status = await pollProviderPaymentStatus({
        method: payment.method as PaymentMethod,
        transactionId: payment.transactionId,
        paymentId,
      });
    }

    await paymentRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (status === "completed") {
      await adminDb.collection("bookings").doc(payment.bookingId).update({
        paymentStatus: "completed",
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: status === "completed",
      status,
      message:
        status === "completed"
          ? "Payment completed successfully"
          : status === "failed"
            ? "Payment failed"
            : "Payment is being processed",
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "Unable to verify payment status" },
      { status: 500 }
    );
  }
}
