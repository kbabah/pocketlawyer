/** Server-side: mobile money gateways configured */
export function isPaymentsGatewayConfigured(): boolean {
  return Boolean(process.env.MTN_API_KEY && process.env.MTN_API_URL);
}

/** Server-side: allow sandbox completion without a real gateway */
export function isPaymentsSandboxMode(): boolean {
  if (process.env.PAYMENTS_SANDBOX === "true") return true;
  return (
    process.env.NODE_ENV === "development" && !isPaymentsGatewayConfigured()
  );
}

/** Whether the booking flow should collect payment before confirmation emails */
export function isPaymentsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "false") return false;
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true") return true;
  return isPaymentsGatewayConfigured() || isPaymentsSandboxMode();
}
