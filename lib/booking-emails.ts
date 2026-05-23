import { authenticatedFetch } from "@/lib/authenticated-fetch";

export async function sendBookingEmails(params: {
  bookingId: string;
  userEmail: string;
  userName: string;
  lawyerEmail: string;
  lawyerName: string;
  userPhone: string;
  bookingDateIso: string;
  bookingTime: string;
  duration: number;
  consultationType: string;
  amount: number;
  notes?: string;
  meetingLink?: string;
}): Promise<void> {
  const base = {
    bookingId: params.bookingId,
    bookingDate: params.bookingDateIso,
    bookingTime: params.bookingTime,
    duration: params.duration,
    consultationType: params.consultationType,
    amount: params.amount,
  };

  await authenticatedFetch("/api/emails/send", {
    method: "POST",
    body: JSON.stringify({
      type: "booking-confirmation",
      ...base,
      userEmail: params.userEmail,
      userName: params.userName,
      lawyerName: params.lawyerName,
      meetingLink: params.meetingLink,
    }),
  });

  await authenticatedFetch("/api/emails/send", {
    method: "POST",
    body: JSON.stringify({
      type: "lawyer-notification",
      ...base,
      lawyerEmail: params.lawyerEmail,
      lawyerName: params.lawyerName,
      userName: params.userName,
      userPhone: params.userPhone,
      notes: params.notes,
    }),
  });
}
