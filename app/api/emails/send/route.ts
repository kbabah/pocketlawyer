import { NextRequest, NextResponse } from 'next/server'
import { 
  sendBookingConfirmation, 
  sendLawyerBookingNotification 
} from '@/lib/services/email-service'

export const dynamic = "force-dynamic";

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

    // Email delivery failures are non-fatal — return 200 so clients don't treat
    // recipient bounces / suppressions as server errors.
    return NextResponse.json({ success: result })
  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }

    )
  }
}
