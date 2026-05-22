/**
 * Unified email module for PocketLawyer.
 *
 * - **campaigns** — template-based sends, bulk mail, scheduling (Postmark + Firestore)
 * - **transactional** — booking confirmations and lawyer notifications
 * - **client** — browser-safe proxy to `/api/email-notification`
 */

export {
  sendEmail as sendCampaignEmail,
  testEmailService,
  sendBulkEmails,
  processScheduledEmails,
  processScheduledCampaigns,
  type EmailTemplate,
  type EmailAttachment,
  type EmailTrackingInfo,
} from "@/lib/email-service";

export {
  sendEmail,
  sendBookingConfirmation,
  sendLawyerBookingNotification,
  type EmailOptions,
} from "./transactional";

export {
  sendEmail as sendClientEmail,
  type EmailTemplate as ClientEmailTemplate,
  type SendEmailParams,
} from "@/lib/email-service-client";
