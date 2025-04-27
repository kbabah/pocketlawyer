import { NextResponse } from 'next/server';
import { sendEmail, sendBulkEmails, testEmailService } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'send':
        const result = await sendEmail(params);
        return NextResponse.json(result);

      case 'bulk':
        const bulkResult = await sendBulkEmails(params);
        return NextResponse.json(bulkResult);

      case 'test':
        const testResult = await testEmailService(params.to);
        return NextResponse.json(testResult);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}