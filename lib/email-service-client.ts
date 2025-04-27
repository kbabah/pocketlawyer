/**
 * Client-side email service interface
 * This file can be safely imported in browser contexts
 */

export type EmailTemplate =
  | 'welcome'
  | 'reset-password'
  | 'chat-summary'
  | 'system-update'
  | 'trial-reminder'
  | 'account-verification'
  | 'verification'
  | 'notification'
  | 'receipt'
  | 'feedback'
  | 'custom';

export type EmailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType: string;
};

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/email-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

export interface BulkEmailParams {
  recipients: { email: string; name?: string }[];
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  attachments?: EmailAttachment[];
  campaignId?: string;
  scheduledFor?: Date;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  emailId?: string;
  error?: string;
  scheduled?: boolean;
}

export interface BulkEmailResponse {
  success: boolean;
  sent: number;
  failed: number;
  bulkEmailId?: string;
  scheduled?: boolean;
  error?: string;
}

export class EmailServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  }

  async sendBulkEmails(params: BulkEmailParams): Promise<BulkEmailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'bulk', ...params }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send bulk emails');
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        sent: 0,
        failed: -1,
        error: error.message || 'Failed to send bulk emails',
      };
    }
  }

  async testEmailService(to: string): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test', to }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to test email service');
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to test email service',
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailServiceClient();