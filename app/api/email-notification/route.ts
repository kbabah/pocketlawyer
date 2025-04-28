import { NextResponse } from 'next/server';
import { sendEmail, EmailTemplate } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const { to, subject, template, data } = await request.json();

    const result = await sendEmail({
      to,
      subject,
      template,
      data,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Email notification API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email notification',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}