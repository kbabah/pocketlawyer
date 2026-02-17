// Email Service for PocketLawyer
// Supports Resend and SendGrid

import { Resend } from 'resend'

const emailProvider = process.env.EMAIL_SERVICE || 'resend'
const resend = emailProvider === 'resend' ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Send an email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const from = options.from || process.env.EMAIL_FROM || 'noreply@pocketlawyer.cm'
    const fromName = process.env.EMAIL_FROM_NAME || 'PocketLawyer'
    const fromAddress = `${fromName} <${from}>`

    if (emailProvider === 'resend' && resend) {
      await resend.emails.send({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      })
      return true
    } else if (emailProvider === 'sendgrid') {
      return await sendWithSendGrid(options, fromAddress)
    } else {
      console.error('No email provider configured')
      return false
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(options: EmailOptions, from: string): Promise<boolean> {
  try {
    // @ts-ignore - sendgrid is an optional dependency
    const sgMail = await import(/* webpackIgnore: true */ '@sendgrid/mail').then(m => m.default || m) as any
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

    await sgMail.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    return true
  } catch (error) {
    console.error('SendGrid error:', error)
    return false
  }
}

/**
 * Send booking confirmation email to user
 */
export async function sendBookingConfirmation(data: {
  userEmail: string
  userName: string
  lawyerName: string
  bookingDate: Date | string
  bookingTime: string
  duration: number
  type?: string
  consultationType?: string
  amount: number
  bookingId: string
  meetingLink?: string
}) {
  // Convert bookingDate to Date if it's a string
  const bookingDate = typeof data.bookingDate === 'string' 
    ? new Date(data.bookingDate) 
    : data.bookingDate
  // Support both 'type' and 'consultationType' field names
  const consultationType = data.consultationType || data.type || 'consultation'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #111827; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed</h1>
          <p>Your consultation has been confirmed</p>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          <p>Your consultation with <strong>${data.lawyerName}</strong> has been confirmed!</p>
          
          <div class="card">
            <h2 style="margin-top: 0;">Booking Details</h2>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time</span>
              <span class="detail-value">${data.bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration</span>
              <span class="detail-value">${data.duration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">${consultationType}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Amount Paid</span>
              <span class="detail-value"><strong>${data.amount.toLocaleString()} XAF</strong></span>
            </div>
          </div>

          ${data.meetingLink ? `
            <div style="text-align: center;">
              <a href="${data.meetingLink}" class="button">Join Video Call</a>
            </div>
          ` : ''}

          <p><strong>What's next?</strong></p>
          <ul>
            <li>You'll receive a reminder 24 hours before your consultation</li>
            <li>The lawyer will contact you at the scheduled time</li>
            <li>Prepare any questions or documents you want to discuss</li>
          </ul>

          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <strong>Need to reschedule?</strong><br>
            Contact us at support@pocketlawyer.cm or manage your booking in the app.
          </div>

          <div class="footer">
            <p>Thank you for choosing PocketLawyer</p>
            <p style="font-size: 12px;">
              Booking ID: ${data.bookingId}<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings">View all bookings</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.userEmail,
    subject: `✅ Consultation Confirmed with ${data.lawyerName}`,
    html,
    text: `Your consultation with ${data.lawyerName} has been confirmed for ${bookingDate.toLocaleDateString()} at ${data.bookingTime}.`,
  })
}

/**
 * Send booking notification to lawyer
 */
export async function sendLawyerBookingNotification(data: {
  lawyerEmail: string
  lawyerName: string
  userName: string
  userPhone: string
  bookingDate: Date | string
  bookingTime: string
  duration: number
  type?: string
  consultationType?: string
  amount: number
  notes?: string
  bookingId: string
}) {
  // Convert bookingDate to Date if it's a string
  const bookingDate = typeof data.bookingDate === 'string' 
    ? new Date(data.bookingDate) 
    : data.bookingDate
  // Support both 'type' and 'consultationType' field names
  const consultationType = data.consultationType || data.type || 'consultation'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { color: #111827; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Booking</h1>
          <p>You have a new consultation request</p>
        </div>
        <div class="content">
          <p>Hello ${data.lawyerName},</p>
          <p>You have a new confirmed consultation booking!</p>
          
          <div class="card">
            <h2 style="margin-top: 0;">Client Information</h2>
            <div class="detail-row">
              <span class="detail-label">Name</span>
              <span class="detail-value">${data.userName}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Phone</span>
              <span class="detail-value">${data.userPhone}</span>
            </div>
          </div>

          <div class="card">
            <h2 style="margin-top: 0;">Consultation Details</h2>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time</span>
              <span class="detail-value">${data.bookingTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration</span>
              <span class="detail-value">${data.duration} minutes</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">${consultationType}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Fee</span>
              <span class="detail-value"><strong>${data.amount.toLocaleString()} XAF</strong></span>
            </div>
            ${data.notes ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f3f4f6;">
                <span class="detail-label">Client Notes:</span>
                <p style="margin: 8px 0 0 0; color: #6b7280;">${data.notes}</p>
              </div>
            ` : ''}
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/lawyer/dashboard" class="button">View in Dashboard</a>
          </div>

          <p><strong>Action Required:</strong></p>
          <ul>
            <li>Review the consultation details</li>
            <li>Prepare for the meeting</li>
            <li>Contact the client at the scheduled time</li>
          </ul>

          <div class="footer">
            <p>Booking ID: ${data.bookingId}</p>
            <p style="font-size: 12px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/lawyer/dashboard">Manage bookings</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.lawyerEmail,
    subject: `🔔 New Booking: ${data.userName} - ${bookingDate.toLocaleDateString()}`,
    html,
    text: `New booking from ${data.userName} for ${bookingDate.toLocaleDateString()} at ${data.bookingTime}.`,
  })
}

/**
 * Send booking reminder (24 hours before)
 */
export async function sendBookingReminder(data: {
  userEmail: string
  userName: string
  lawyerName: string
  bookingDate: Date | string
  bookingTime: string
  type: string
  meetingLink?: string
  bookingId: string
}) {
  const bookingDate = typeof data.bookingDate === 'string' 
    ? new Date(data.bookingDate) 
    : data.bookingDate
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Reminder: Tomorrow</h1>
          <p>Your consultation is coming up soon</p>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          <p>This is a friendly reminder about your upcoming consultation with <strong>${data.lawyerName}</strong>.</p>
          
          <div class="card" style="background: #fef3c7; border-color: #f59e0b;">
            <h2 style="margin-top: 0; color: #92400e;">Tomorrow at ${data.bookingTime}</h2>
            <p style="margin: 0; font-size: 18px; color: #78350f;">${bookingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>

          ${data.meetingLink ? `
            <div style="text-align: center;">
              <a href="${data.meetingLink}" class="button">Join Video Call</a>
            </div>
          ` : ''}

          <p><strong>Prepare for your consultation:</strong></p>
          <ul>
            <li>Review any documents you want to discuss</li>
            <li>Write down your questions</li>
            <li>Test your internet connection (for video calls)</li>
            <li>Be ready 5 minutes before the scheduled time</li>
          </ul>

          <div class="footer">
            <p>Need to reschedule? <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings">Manage booking</a></p>
            <p style="font-size: 12px;">Booking ID: ${data.bookingId}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.userEmail,
    subject: `⏰ Reminder: Consultation tomorrow with ${data.lawyerName}`,
    html,
    text: `Reminder: Your consultation with ${data.lawyerName} is tomorrow at ${data.bookingTime}.`,
  })
}

/**
 * Send cancellation notification
 */
export async function sendCancellationEmail(data: {
  userEmail: string
  userName: string
  lawyerName: string
  bookingDate: Date | string
  reason: string
  cancelledBy: string
}) {
  const bookingDate = typeof data.bookingDate === 'string' 
    ? new Date(data.bookingDate) 
    : data.bookingDate
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          <p>Your consultation with <strong>${data.lawyerName}</strong> scheduled for ${bookingDate.toLocaleDateString()} has been cancelled.</p>
          
          <div class="card" style="background: #fee2e2; border-color: #ef4444;">
            <p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>
            <p style="margin: 8px 0 0 0; color: #6b7280;"><small>Cancelled by: ${data.cancelledBy}</small></p>
          </div>

          <p>We're sorry for any inconvenience. You can book another consultation anytime.</p>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/lawyers" class="button">Find Another Lawyer</a>
          </div>

          <div class="footer">
            <p>Questions? Contact us at support@pocketlawyer.cm</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.userEmail,
    subject: `Booking Cancelled: ${data.lawyerName}`,
    html,
    text: `Your consultation with ${data.lawyerName} has been cancelled. Reason: ${data.reason}`,
  })
}

/**
 * Send review request after completed consultation
 */
export async function sendReviewRequest(data: {
  userEmail: string
  userName: string
  lawyerName: string
  lawyerId: string
  bookingId: string
}) {
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/bookings?review=${data.bookingId}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .stars { font-size: 32px; text-align: center; margin: 20px 0; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ How was your consultation?</h1>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          <p>Thank you for using PocketLawyer! We hope your consultation with <strong>${data.lawyerName}</strong> was helpful.</p>
          
          <div class="stars">⭐⭐⭐⭐⭐</div>

          <p style="text-align: center;">Your feedback helps other users find great lawyers and helps lawyers improve their service.</p>

          <div style="text-align: center;">
            <a href="${reviewUrl}" class="button">Leave a Review</a>
          </div>

          <p style="text-align: center; color: #6b7280; font-size: 14px;">
            This will only take a minute!
          </p>

          <div class="footer">
            <p>Thank you for choosing PocketLawyer</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.userEmail,
    subject: `⭐ How was your consultation with ${data.lawyerName}?`,
    html,
    text: `Please leave a review for your consultation with ${data.lawyerName}. Visit: ${reviewUrl}`,
  })
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: {
  userEmail: string
  userName: string
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .feature { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Welcome to PocketLawyer!</h1>
          <p>Legal help made simple</p>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          <p>Welcome to PocketLawyer - your trusted partner for legal guidance in Cameroon!</p>
          
          <h2>What you can do:</h2>

          <div class="feature">
            <strong>💬 AI Legal Assistant</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Get instant answers to your legal questions</p>
          </div>

          <div class="feature">
            <strong>👨‍⚖️ Find Lawyers</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Browse verified lawyers by specialty and rating</p>
          </div>

          <div class="feature">
            <strong>📅 Book Consultations</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Schedule video, phone, or in-person meetings</p>
          </div>

          <div class="feature">
            <strong>📄 Document Analysis</strong>
            <p style="margin: 5px 0 0 0; color: #6b7280;">Upload and analyze your legal documents</p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Get Started</a>
          </div>

          <div class="footer">
            <p>Need help? Contact us at support@pocketlawyer.cm</p>
            <p style="font-size: 12px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit Website</a> |
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/lawyers">Find Lawyers</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.userEmail,
    subject: '👋 Welcome to PocketLawyer!',
    html,
    text: `Welcome to PocketLawyer! Get instant legal help, find verified lawyers, and book consultations. Visit: ${process.env.NEXT_PUBLIC_APP_URL}`,
  })
}
