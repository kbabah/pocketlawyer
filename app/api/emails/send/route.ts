import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic";
import { 
  sendBookingConfirmation, 
  sendLawyerBookingNotification 
} from '@/lib/services/email-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, ...data } = body

    let result = false

    switch (type) {
      case 'booking-confirmation':
        result = await sendBookingConfirmation(data)
        break
      
      case 'lawyer-notification':
        result = await sendLawyerBookingNotification(data)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    if (result) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
