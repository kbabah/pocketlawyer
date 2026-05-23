// Payment Service for PocketLawyer — client calls server APIs (gateways stay server-side)

import { authenticatedFetch } from "@/lib/authenticated-fetch";

export type PaymentMethod = "mtn" | "orange";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface PaymentData {
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  phoneNumber: string;
  userId: string;
  userEmail: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  paymentId?: string;
}

export async function fetchPaymentsConfig(): Promise<{
  enabled: boolean;
  sandbox: boolean;
}> {
  try {
    const res = await fetch("/api/payments/config");
    if (!res.ok) return { enabled: false, sandbox: false };
    return res.json();
  } catch {
    return { enabled: false, sandbox: false };
  }
}

/**
 * Initiate a payment for a booking (server-side gateway)
 */
export async function initiatePayment(
  data: PaymentData
): Promise<PaymentResult> {
  try {
    const response = await authenticatedFetch("/api/payments/initiate", {
      method: "POST",
      body: JSON.stringify({
        bookingId: data.bookingId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        phoneNumber: data.phoneNumber,
        description: data.description,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Payment initiation failed",
      };
    }

    return {
      success: result.success,
      message: result.message,
      paymentId: result.paymentId,
      transactionId: result.transactionId,
    };
  } catch (error) {
    console.error("Payment initiation error:", error);
    return {
      success: false,
      message: "Payment initiation failed. Please try again.",
    };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(paymentId: string): Promise<PaymentResult> {
  try {
    const response = await authenticatedFetch("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: result.error || "Unable to verify payment",
      };
    }

    const completed = result.status === "completed";
    return {
      success: completed,
      message: result.message,
      transactionId: result.transactionId,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      message: "Unable to verify payment status",
    };
  }
}
