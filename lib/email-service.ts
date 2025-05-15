// This module should only be imported from server components or API routes
if (typeof window !== 'undefined') {
  throw new Error('email-service.ts should only be imported from server-side code');
}

import { ServerClient } from 'postmark';
import crypto from 'crypto';
import { db } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Postmark client
const client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN || '');

// Email template types
export type EmailTemplate = 
  | 'welcome' 
  | 'reset-password' 
  | 'chat-summary' 
  | 'system-update' 
  | 'trial-reminder'
  | 'account-verification'
  | 'newsletter'
  | 'legal-alert'
  | 'weekly-summary'
  | 'document-shared'
  | 'subscription-confirmation'
  | 'custom';

// Email attachment interface
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

// Email parameters interface
interface SendEmailParams {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  attachments?: EmailAttachment[];
  trackingEnabled?: boolean;
  campaignId?: string;
  scheduledFor?: Date;
}

// Email tracking interface
export interface EmailTrackingInfo {
  emailId: string;
  recipient: string;
  subject: string;
  template: EmailTemplate;
  campaignId?: string;
  sentAt: Date;
  opened: boolean;
  openedAt?: Date;
  openCount: number;
  clicked: boolean;
  clickedAt?: Date;
  clickCount: number;
  links: {
    url: string;
    clicks: number;
  }[];
}

/**
 * Generate a unique email ID for tracking
 */
function generateEmailId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Add tracking pixel to HTML content
 */
function addTrackingPixel(htmlContent: string, emailId: string): string {
  const trackingPixelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/tracking/pixel/${emailId}`;
  const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
  
  // Add before closing body tag
  return htmlContent.replace('</body>', `${trackingPixel}</body>`);
}

/**
 * Add tracking to links in HTML content
 */
function addLinkTracking(htmlContent: string, emailId: string): string {
  // Regex to find links
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>/gi;
  let match;
  let modifiedContent = htmlContent;
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    const originalLink = match[0];
    const url = match[1];
    
    // Skip tracking pixels and anchor links
    if (url.includes('/api/email/tracking/') || url.startsWith('#')) {
      continue;
    }
    
    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/tracking/link/${emailId}?url=${encodeURIComponent(url)}`;
    const trackedLink = originalLink.replace(`href="${url}"`, `href="${trackingUrl}"`);
    
    modifiedContent = modifiedContent.replace(originalLink, trackedLink);
  }
  
  return modifiedContent;
}

/**
 * Store initial tracking data in Firestore
 */
async function storeInitialTrackingData(
  emailId: string, 
  recipient: string, 
  subject: string, 
  template: EmailTemplate,
  campaignId?: string
): Promise<void> {
  try {
    await db.collection('emailTracking').doc(emailId).set({
      emailId,
      recipient,
      subject,
      template,
      campaignId,
      sentAt: Timestamp.now(),
      opened: false,
      openCount: 0,
      clicked: false,
      clickCount: 0,
      links: []
    });
  } catch (error) {
    console.error('Failed to store email tracking data:', error);
  }
}

/**
 * Send email using Postmark
 */
export async function sendEmail({ 
  to, 
  subject, 
  template, 
  data, 
  attachments = [],
  trackingEnabled = true,
  campaignId,
  scheduledFor
}: SendEmailParams) {
  try {
    // If scheduled for future, queue the email and return
    if (scheduledFor && scheduledFor > new Date()) {
      const queuedEmail = {
        to: Array.isArray(to) ? to : [to],
        subject,
        template,
        data,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          contentType: att.contentType
        })),
        trackingEnabled,
        campaignId,
        scheduledFor: Timestamp.fromDate(scheduledFor),
        status: 'scheduled',
        createdAt: Timestamp.now()
      };
      
      const docRef = await db.collection('scheduledEmails').add(queuedEmail);
      return { 
        success: true, 
        scheduled: true,
        emailId: docRef.id
      };
    }

    // Generate tracking ID if tracking enabled
    const emailId = trackingEnabled ? generateEmailId() : undefined;
    
    // Get HTML content for the template
    let htmlContent = getEmailTemplate(template, data);
    
    // Add tracking if enabled
    if (trackingEnabled && emailId) {
      htmlContent = addTrackingPixel(htmlContent, emailId);
      htmlContent = addLinkTracking(htmlContent, emailId);
      
      // Store tracking data for each recipient
      const recipients = Array.isArray(to) ? to : [to];
      for (const recipient of recipients) {
        await storeInitialTrackingData(emailId, recipient, subject, template, campaignId);
      }
    }

    // Format attachments for Postmark
    const postmarkAttachments = attachments.map(att => ({
      Name: att.filename,
      Content: Buffer.isBuffer(att.content) 
        ? att.content.toString('base64') 
        : typeof att.content === 'string' 
          ? Buffer.from(att.content).toString('base64') 
          : att.content.toString('base64'),
      ContentType: att.contentType
    }));

    // Set up email to send
    const messageData = {
      From: process.env.EMAIL_FROM || 'notifications@pocketlawyer.cm',
      To: Array.isArray(to) ? to.join(',') : to,
      Subject: subject,
      HtmlBody: htmlContent,
      TextBody: stripHtml(htmlContent),
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound',
      Attachments: postmarkAttachments.length > 0 ? postmarkAttachments : undefined
    };

    // Send email via Postmark
    console.log(`Sending email via Postmark to ${Array.isArray(to) ? to.join(', ') : to}`);
    const response = await client.sendEmail(messageData);

    return { 
      success: true, 
      messageId: response.MessageID,
      emailId
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

/**
 * Get the appropriate email template
 */
function getEmailTemplate(template: EmailTemplate, data?: Record<string, any>): string {
  switch (template) {
    case 'welcome':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Welcome to PocketLawyer 🇨🇲</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>Thank you for creating an account with PocketLawyer. We're excited to help you navigate legal questions in Cameroon.</p>
            <p>You now have full access to all features including:</p>
            <ul>
              <li>Unlimited conversations with our legal AI</li>
              <li>Chat history saved for future reference</li>
              <li>Personalized legal guidance</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Get Started</a>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'reset-password':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Password Reset Request</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>We received a request to reset your password. Click the link below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data?.resetLink}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
            </div>
            <p>If you didn't request a password reset, you can ignore this email.</p>
            <p>The link will expire in 1 hour for security reasons.</p>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'chat-summary':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Chat Summary</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>Here's a summary of your recent conversation with PocketLawyer:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
              ${data?.summary || 'No summary available'}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/chat/${data?.chatId}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">View Full Conversation</a>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'system-update':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">PocketLawyer Update</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>We're excited to announce some updates to PocketLawyer:</p>
            <div style="background-color: #f9f9f9; border: 1px solid #eaeaea; padding: 15px; margin: 20px 0; border-radius: 4px;">
              ${data?.updateContent || 'No update details available'}
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'trial-reminder':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff3cd; padding: 20px; text-align: center;">
            <h1 style="color: #856404;">Trial Conversations Remaining: ${data?.conversationsLeft}</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello there,</p>
            <p>This is a friendly reminder that you have ${data?.conversationsLeft} trial conversations remaining with PocketLawyer.</p>
            <p>To ensure continued access to legal guidance, we recommend creating a free account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/sign-up" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Create Free Account</a>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'account-verification':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Verify Your Email</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>Thank you for creating an account with PocketLawyer. To complete your registration, please verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data?.verificationLink}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
            </div>
            <p>If you did not create an account with PocketLawyer, you can safely ignore this email.</p>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'newsletter':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${data?.title || 'PocketLawyer Newsletter'}</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            ${data?.content || '<p>No content available</p>'}
            ${data?.callToAction ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.callToAction.link}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">${data.callToAction.text}</a>
              </div>
            ` : ''}
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'legal-alert':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; padding: 20px; text-align: center;">
            <h1 style="color: white;">Legal Alert - ${data?.alertType || 'Important Update'}</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p><strong>${data?.headline || 'Important Legal Update'}</strong></p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
              ${data?.alertContent || 'No alert content available'}
            </div>
            ${data?.actionRequired ? `
              <div style="background-color: #fff3cd; border: 1px solid #ffeeba; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>Action Required:</strong> ${data.actionRequired}
              </div>
            ` : ''}
            ${data?.link ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.link}" style="background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">View Details</a>
            ` : ''}
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'weekly-summary':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Your Weekly Legal Summary</h1>
            <p style="color: #666;">${data?.weekRange || 'This Week'}</p>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            
            ${data?.activityStats ? `
              <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Your Activity</h2>
              <div style="display: flex; justify-content: space-around; text-align: center; margin: 20px 0;">
                <div>
                  <div style="font-size: 24px; font-weight: bold; color: #007bff;">${data.activityStats.conversations || 0}</div>
                  <div style="color: #666;">Conversations</div>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: bold; color: #28a745;">${data.activityStats.documents || 0}</div>
                  <div style="color: #666;">Documents</div>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: bold; color: #fd7e14;">${data.activityStats.searches || 0}</div>
                  <div style="color: #666;">Searches</div>
                </div>
              </div>
            ` : ''}
            
            ${data?.recentConversations?.length ? `
              <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Recent Conversations</h2>
              <ul style="padding-left: 20px;">
                ${data.recentConversations.map((conv: any) => `
                  <li style="margin-bottom: 10px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/chat/${conv.id}" style="color: #007bff; text-decoration: none; font-weight: bold;">${conv.title}</a>
                    <div style="color: #666; font-size: 14px;">${conv.date}</div>
                  </li>
                `).join('')}
              </ul>
            ` : ''}
            
            ${data?.legalUpdates?.length ? `
              <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Legal Updates</h2>
              <div style="margin-top: 15px;">
                ${data.legalUpdates.map((update: any) => `
                  <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #eee;">
                    <h3 style="margin: 0 0 5px 0;">${update.title}</h3>
                    <p style="margin: 0 0 10px 0; color: #666;">${update.summary}</p>
                    ${update.link ? `<a href="${update.link}" style="color: #007bff; text-decoration: none;">Read more →</a>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Go to PocketLawyer</a>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'document-shared':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Document Shared With You</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>${data?.senderName || 'Someone'} has shared a document with you.</p>
            
            <div style="background-color: #f9f9f9; border: 1px solid #eaeaea; border-radius: 4px; padding: 15px; margin: 20px 0;">
              <div style="display: flex; align-items: center;">
                <div style="margin-right: 15px;">
                  <img src="${process.env.NEXT_PUBLIC_BASE_URL}/document-icon.png" alt="Document" style="width: 48px; height: 48px;">
                </div>
                <div>
                  <h3 style="margin: 0 0 5px 0;">${data?.documentName || 'Unnamed Document'}</h3>
                  <p style="margin: 0; color: #666; font-size: 14px;">${data?.documentType || 'Document'} • ${data?.documentSize || 'Unknown size'}</p>
                </div>
              </div>
              
              ${data?.message ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eaeaea;">
                  <p style="margin: 0; font-style: italic;">"${data.message}"</p>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data?.documentUrl || process.env.NEXT_PUBLIC_BASE_URL}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">View Document</a>
            </div>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'subscription-confirmation':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Legal Updates Subscription Confirmed</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            
            <p>Thank you for subscribing to our Legal Updates newsletter! Your subscription has been confirmed.</p>
            
            <p>You'll now receive the latest articles, legal insights, and resources on Cameroonian law directly to your inbox. Our goal is to keep you informed about important legal developments that may affect you.</p>
            
            <div style="background-color: #f5f5f5; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
              <p style="margin-top: 0;"><strong>What to expect:</strong></p>
              <ul style="padding-left: 20px;">
                <li>Legal news and updates from Cameroon</li>
                <li>Practical guides on common legal issues</li>
                <li>Explanations of new legislation and regulations</li>
                <li>Tips on protecting your rights and interests</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/blog" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px;">Browse Our Legal Resources</a>
            </div>
            
            <p>If you have any questions or need legal assistance, don't hesitate to use our AI-powered chat assistant on our website.</p>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    case 'custom':
      // For custom emails, use the provided HTML content
      return data?.htmlContent || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 20px;">
            <h1>${data?.subject || 'Notification'}</h1>
            <p>${data?.content || 'No content provided'}</p>
          </div>
          ${getEmailFooter()}
        </div>
      `;
      
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 20px;">
            <h1>${subject}</h1>
            <p>No template content available.</p>
          </div>
          ${getEmailFooter()}
        </div>
      `;
  }
}

/**
 * Common email footer
 */
function getEmailFooter() {
  return `
    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      <p>PocketLawyer - Legal guidance at your fingertips</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/notifications" style="color: #007bff; text-decoration: none;">Email Preferences</a> |
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms" style="color: #007bff; text-decoration: none;">Terms of Service</a> |
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy" style="color: #007bff; text-decoration: none;">Privacy Policy</a>
      </p>
    </div>
  `;
}

/**
 * Simple HTML stripper for text emails
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Test the email service
 */
export async function testEmailService(to: string): Promise<{success: boolean, message: string}> {
  try {
    const result = await sendEmail({
      to,
      subject: 'PocketLawyer Email Test',
      template: 'welcome',
      data: { name: 'Test User' }
    });
    
    return { 
      success: !!result.messageId, 
      message: result.messageId 
        ? `Email sent successfully with ID: ${result.messageId}` 
        : 'Failed to send email' 
    };
  } catch (error) {
    return { success: false, message: `Error: ${error}` };
  }
}

/**
 * Send bulk emails to a list of recipients
 */
export async function sendBulkEmails({
  recipients,
  subject,
  template,
  data,
  campaignId,
  attachments = [],
  scheduledFor
}: {
  recipients: { email: string; name?: string }[];
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  campaignId?: string;
  attachments?: EmailAttachment[];
  scheduledFor?: Date;
}): Promise<{ success: boolean; sent: number; failed: number; scheduled?: boolean }> {
  try {
    // If scheduled for future, store the campaign and return
    if (scheduledFor && scheduledFor > new Date()) {
      const campaign = {
        recipients: recipients.map(r => ({ email: r.email, name: r.name || null })),
        subject,
        template,
        data: data || {},
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          contentType: att.contentType
        })),
        campaignId,
        scheduledFor: Timestamp.fromDate(scheduledFor),
        status: 'scheduled',
        createdAt: Timestamp.now(),
        sentCount: 0,
        failedCount: 0,
        totalCount: recipients.length
      };
      
      await db.collection('emailCampaigns').doc(campaignId || generateEmailId()).set(campaign);
      
      return {
        success: true,
        scheduled: true,
        sent: 0,
        failed: 0
      };
    }
    
    // Send emails to each recipient
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        sendEmail({
          to: recipient.email,
          subject,
          template,
          data: { ...data, name: recipient.name || recipient.email.split('@')[0] },
          campaignId,
          attachments,
          trackingEnabled: true
        })
      )
    );
    
    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value?.success).length;
    const failed = recipients.length - sent;
    
    // Update campaign stats if campaignId provided
    if (campaignId) {
      await db.collection('emailCampaigns').doc(campaignId).update({
        status: 'completed',
        sentCount: sent,
        failedCount: failed,
        completedAt: Timestamp.now()
      });
    }
    
    return {
      success: failed === 0,
      sent,
      failed
    };
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    return {
      success: false,
      sent: 0,
      failed: recipients.length
    };
  }
}

/**
 * Process all scheduled emails that are due
 */
export async function processScheduledEmails(): Promise<{ processed: number; succeeded: number; failed: number }> {
  try {
    const now = new Date();
    
    // Get all scheduled emails due for sending
    const scheduledEmailsSnapshot = await db
      .collection('scheduledEmails')
      .where('scheduledFor', '<=', Timestamp.fromDate(now))
      .where('status', '==', 'scheduled')
      .limit(100)
      .get();
      
    if (scheduledEmailsSnapshot.empty) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }
    
    let succeeded = 0;
    let failed = 0;
    
    // Process each scheduled email
    for (const doc of scheduledEmailsSnapshot.docs) {
      const scheduledEmail = doc.data();
      
      try {
        // Convert base64 attachments back to buffers
        const attachments = scheduledEmail.attachments?.map((att: any) => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.contentType
        })) || [];
        
        // Send the email
        const result = await sendEmail({
          to: scheduledEmail.to,
          subject: scheduledEmail.subject,
          template: scheduledEmail.template,
          data: scheduledEmail.data,
          attachments,
          trackingEnabled: scheduledEmail.trackingEnabled,
          campaignId: scheduledEmail.campaignId
        });
        
        // Update status
        await doc.ref.update({
          status: result.success ? 'sent' : 'failed',
          sentAt: result.success ? Timestamp.now() : null,
          error: result.success ? null : result.error,
          messageId: result.messageId
        });
        
        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to process scheduled email ${doc.id}:`, error);
        
        // Update status to failed
        await doc.ref.update({
          status: 'failed',
          error: String(error)
        });
        
        failed++;
      }
    }
    
    return {
      processed: scheduledEmailsSnapshot.size,
      succeeded,
      failed
    };
  } catch (error) {
    console.error('Failed to process scheduled emails:', error);
    return { processed: 0, succeeded: 0, failed: 0 };
  }
}

/**
 * Process all scheduled campaigns that are due
 */
export async function processScheduledCampaigns(): Promise<{ processed: number; succeeded: number; failed: number }> {
  try {
    const now = new Date();
    
    // Get all scheduled campaigns due for sending
    const campaignsSnapshot = await db
      .collection('emailCampaigns')
      .where('scheduledFor', '<=', Timestamp.fromDate(now))
      .where('status', '==', 'scheduled')
      .limit(10)
      .get();
      
    if (campaignsSnapshot.empty) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }
    
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    
    // Process each campaign
    for (const doc of campaignsSnapshot.docs) {
      const campaign = doc.data();
      processed++;
      
      try {
        // Update status to processing
        await doc.ref.update({
          status: 'processing',
          processingStartedAt: Timestamp.now()
        });
        
        // Convert base64 attachments back to buffers
        const attachments = campaign.attachments?.map((att: any) => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.contentType
        })) || [];
        
        // Send bulk emails
        const result = await sendBulkEmails({
          recipients: campaign.recipients,
          subject: campaign.subject,
          template: campaign.template,
          data: campaign.data,
          campaignId: doc.id,
          attachments
        });
        
        // Update campaign stats
        await doc.ref.update({
          status: 'completed',
          sentCount: result.sent,
          failedCount: result.failed,
          completedAt: Timestamp.now()
        });
        
        succeeded++;
      } catch (error) {
        console.error(`Failed to process campaign ${doc.id}:`, error);
        
        // Update status to failed
        await doc.ref.update({
          status: 'failed',
          error: String(error),
          completedAt: Timestamp.now()
        });
        
        failed++;
      }
    }
    
    return { processed, succeeded, failed };
  } catch (error) {
    console.error('Failed to process scheduled campaigns:', error);
    return { processed: 0, succeeded: 0, failed: 0 };
  }
}