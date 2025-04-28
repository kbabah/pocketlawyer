import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';
import * as mailComposer from 'nodemailer/lib/mail-composer';
import { EmailTemplate, SendEmailParams } from '../../../../lib/email-service-client';
import admin from '@/lib/firebase-admin';

// Explicitly configure AWS credentials from environment variables
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create SES client
const ses = new AWS.SES();

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
    await adminDb.collection('emailTracking').doc(emailId).set({
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
      
    // Include other email templates as in the original file
    // ...

    default:
      // Return custom template or default one
      return data?.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">${data?.subject || 'Message from PocketLawyer'}</h1>
          </div>
          <div style="padding: 20px;">
            <p>Hello ${data?.name || 'there'},</p>
            <p>${data?.message || 'Thank you for using PocketLawyer.'}</p>
          </div>
          ${getEmailFooter()}
        </div>
      `;
  }
}

/**
 * Get standardized email footer
 */
function getEmailFooter(): string {
  return `
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p>© ${new Date().getFullYear()} PocketLawyer. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/terms" style="color: #666; text-decoration: none; margin: 0 10px;">Terms</a>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/privacy" style="color: #666; text-decoration: none; margin: 0 10px;">Privacy</a>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/contact" style="color: #666; text-decoration: none; margin: 0 10px;">Contact</a>
      </p>
    </div>
  `;
}

/**
 * Strip HTML tags from content to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build raw email with attachments
 */
async function buildRawEmail(
  to: string[],
  from: string,
  subject: string,
  htmlBody: string,
  textBody: string,
  attachments: any[]
): Promise<AWS.SES.SendRawEmailRequest> {
  // Use mailComposer directly 
  const mail = new mailComposer({
    from,
    to,
    subject,
    html: htmlBody,
    text: textBody,
    attachments: attachments.map(attachment => ({
      filename: attachment.filename,
      content: Buffer.isBuffer(attachment.content) 
        ? attachment.content 
        : Buffer.from(attachment.content, 'base64'),
      contentType: attachment.contentType
    }))
  });
  
  const message = await mail.compile().build();
  
  return {
    RawMessage: {
      Data: message
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const params: SendEmailParams = await req.json();
    const { to, subject, template, data, attachments = [], trackingEnabled = true, campaignId, scheduledFor } = params;
    
    // If scheduled for future, queue the email and return
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      const queuedEmail = {
        to: Array.isArray(to) ? to : [to],
        subject,
        template,
        data,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        })),
        trackingEnabled,
        campaignId,
        scheduledFor: Timestamp.fromDate(new Date(scheduledFor)),
        status: 'scheduled',
        createdAt: Timestamp.now()
      };
      
      const docRef = await adminDb.collection('scheduledEmails').add(queuedEmail);
      return NextResponse.json({ 
        success: true, 
        scheduled: true,
        emailId: docRef.id
      });
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
    
    // Prepare email parameters
    const emailParams: AWS.SES.SendEmailRequest = {
      Source: process.env.EMAIL_FROM || 'notifications@pocketlawyer.cm',
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8',
          },
          Text: {
            Data: stripHtml(htmlContent),
            Charset: 'UTF-8',
          },
        },
      },
    };
    
    // Handle attachments if any
    if (attachments.length > 0) {
      // If we have attachments, use SendRawEmail instead
      const rawEmailParams = await buildRawEmail(
        Array.isArray(to) ? to : [to],
        process.env.EMAIL_FROM || 'notifications@pocketlawyer.cm',
        subject,
        htmlContent,
        stripHtml(htmlContent),
        attachments
      );
      
      const result = await ses.sendRawEmail(rawEmailParams).promise();
      return NextResponse.json({ 
        success: true, 
        messageId: result.MessageId,
        emailId
      });
    }
    
    // Send standard email (no attachments)
    const result = await ses.sendEmail(emailParams).promise();
    return NextResponse.json({ 
      success: true, 
      messageId: result.MessageId,
      emailId
    });
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Render email template with data
 */
async function renderEmailTemplate(template: string, data: Record<string, any>): Promise<string> {
  // In a real implementation, you might use a templating engine like Handlebars or EJS
  // For this example, we'll use a simple placeholder replacement
  
  // Get template from Firestore or other source
  const templateDoc = await admin.firestore().collection('emailTemplates').doc(template).get();
  
  if (!templateDoc.exists) {
    throw new Error(`Email template '${template}' not found`);
  }
  
  let html = templateDoc.data()?.html || '';
  
  // Replace placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, String(value));
  });
  
  return html;
}