import type { PaymentMethod, PaymentStatus } from "@/lib/services/payment-service";
import { isPaymentsSandboxMode } from "@/lib/payments-config";

export function isValidCameroonPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "");
  return /^(6\d{8}|(\+237|00237)6\d{8})$/.test(cleaned);
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("+237")) return cleaned;
  if (cleaned.startsWith("00237")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("6")) return `+237${cleaned}`;
  return cleaned;
}

export async function requestProviderPayment(params: {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  phoneNumber: string;
  description: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> {
  if (isPaymentsSandboxMode()) {
    return {
      success: true,
      transactionId: `sandbox-${params.paymentId}`,
      message:
        "Sandbox payment started. Verification will complete automatically for testing.",
    };
  }

  if (params.method === "mtn") {
    return processMTNPayment(params);
  }
  return processOrangePayment(params);
}

export async function pollProviderPaymentStatus(params: {
  method: PaymentMethod;
  transactionId: string;
  paymentId: string;
}): Promise<PaymentStatus> {
  if (
    isPaymentsSandboxMode() ||
    params.transactionId.startsWith("sandbox-")
  ) {
    return "completed";
  }

  if (params.method === "mtn") {
    return checkMTNPaymentStatus(params.transactionId);
  }
  return checkOrangePaymentStatus(params.transactionId);
}

async function processMTNPayment(params: {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  description: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> {
  if (!process.env.MTN_API_KEY || !process.env.MTN_API_URL) {
    return {
      success: false,
      message: "MTN Mobile Money is not configured.",
    };
  }

  try {
    const response = await fetch(
      `${process.env.MTN_API_URL}/collection/v1_0/requesttopay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MTN_API_TOKEN || ""}`,
          "X-Reference-Id": params.paymentId,
          "X-Target-Environment": process.env.MTN_ENVIRONMENT || "sandbox",
          "Ocp-Apim-Subscription-Key": process.env.MTN_API_KEY,
        },
        body: JSON.stringify({
          amount: params.amount.toString(),
          currency: params.currency,
          externalId: params.bookingId,
          payer: {
            partyIdType: "MSISDN",
            partyId: params.phoneNumber,
          },
          payerMessage: params.description,
          payeeNote: `PocketLawyer - Booking ${params.bookingId}`,
        }),
      }
    );

    if (response.ok) {
      return {
        success: true,
        transactionId: params.paymentId,
        message:
          "Payment request sent. Please check your phone to complete the payment.",
      };
    }

    return {
      success: false,
      message: "Payment request failed. Please check your phone number and try again.",
    };
  } catch (error) {
    console.error("MTN payment error:", error);
    return {
      success: false,
      message: "MTN Mobile Money service unavailable. Please try again later.",
    };
  }
}

async function processOrangePayment(params: {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  description: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> {
  if (!process.env.ORANGE_API_KEY || !process.env.ORANGE_API_URL) {
    return {
      success: false,
      message: "Orange Money is not configured.",
    };
  }

  try {
    const response = await fetch(`${process.env.ORANGE_API_URL}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ORANGE_API_TOKEN || ""}`,
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency,
        order_id: params.bookingId,
        payment_id: params.paymentId,
        customer_msisdn: params.phoneNumber,
        merchant_key: process.env.ORANGE_MERCHANT_KEY,
        description: params.description,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings`,
        notif_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        transactionId: result.payment_token || params.paymentId,
        message:
          "Payment request sent. Please check your phone to complete the payment.",
      };
    }

    return {
      success: false,
      message: "Payment request failed. Please check your phone number and try again.",
    };
  } catch (error) {
    console.error("Orange payment error:", error);
    return {
      success: false,
      message: "Orange Money service unavailable. Please try again later.",
    };
  }
}

async function checkMTNPaymentStatus(transactionId: string): Promise<PaymentStatus> {
  if (!process.env.MTN_API_URL || !process.env.MTN_API_KEY) {
    return "pending";
  }

  try {
    const response = await fetch(
      `${process.env.MTN_API_URL}/collection/v1_0/requesttopay/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MTN_API_TOKEN || ""}`,
          "X-Target-Environment": process.env.MTN_ENVIRONMENT || "sandbox",
          "Ocp-Apim-Subscription-Key": process.env.MTN_API_KEY,
        },
      }
    );

    if (!response.ok) return "pending";

    const data = await response.json();
    switch (data.status) {
      case "SUCCESSFUL":
        return "completed";
      case "FAILED":
        return "failed";
      default:
        return "processing";
    }
  } catch {
    return "pending";
  }
}

async function checkOrangePaymentStatus(
  transactionId: string
): Promise<PaymentStatus> {
  if (!process.env.ORANGE_API_URL) return "pending";

  try {
    const response = await fetch(
      `${process.env.ORANGE_API_URL}/payment/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ORANGE_API_TOKEN || ""}`,
        },
      }
    );

    if (!response.ok) return "pending";

    const data = await response.json();
    switch (data.status) {
      case "SUCCESS":
        return "completed";
      case "FAILED":
      case "EXPIRED":
        return "failed";
      default:
        return "processing";
    }
  } catch {
    return "pending";
  }
}
