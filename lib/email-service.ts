import AWS from 'aws-sdk';

// Explicitly configure AWS credentials from environment variables
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create SES client
const ses = new AWS.SES();

// Email template types
export type EmailTemplate = 
  | 'welcome' 
  | 'reset-password' 
  | 'chat-summary' 
  | 'system-update' 
  | 'trial-reminder'
  | 'account-verification';

// Email parameters interface
interface SendEmailParams {
  to: string;
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

/**
 * Send email using AWS SES
 */
export async function sendEmail({ to, subject, template, data }: SendEmailParams) {
  try {
    const htmlContent = getEmailTemplate(template, data);
    
    const params = {
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
    
    const result = await ses.sendEmail(params).promise();
    return { success: true, messageId: result.MessageId };
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