import { NextResponse } from "next/server";
import {
  isPaymentsEnabled,
  isPaymentsSandboxMode,
} from "@/lib/payments-config";

export async function GET() {
  return NextResponse.json({
    enabled: isPaymentsEnabled(),
    sandbox: isPaymentsSandboxMode(),
  });
}
