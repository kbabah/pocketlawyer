import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, adminDb } = await getFirebaseAdmin()
    
    // Get the lawyer's availability
    const availabilityDoc = await adminDb.collection('lawyers')
      .doc(params.id)
      .collection('availability')
      .doc('schedule')
      .get()

    if (!availabilityDoc.exists) {
      return NextResponse.json({ 
        schedule: {} 
      })
    }

    return NextResponse.json(availabilityDoc.data())

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { auth, adminDb } = await getFirebaseAdmin()
    
    // Verify the session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('firebase-session')?.value
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify session and get user
    const decodedClaims = await auth.verifySessionCookie(sessionCookie)
    
    // Only allow lawyers to update their own availability
    if (decodedClaims.uid !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { schedule } = await request.json()
    
    if (!schedule || typeof schedule !== 'object') {
      return NextResponse.json(
        { error: 'Invalid schedule format' },
        { status: 400 }
      )
    }

    // Validate schedule format
    for (const [day, slots] of Object.entries(schedule)) {
      if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day.toLowerCase())) {
        return NextResponse.json(
          { error: 'Invalid day in schedule' },
          { status: 400 }
        )
      }

      if (!Array.isArray(slots)) {
        return NextResponse.json(
          { error: 'Time slots must be an array' },
          { status: 400 }
        )
      }

      for (const slot of slots) {
        if (!slot.start || !slot.end || typeof slot.start !== 'string' || typeof slot.end !== 'string') {
          return NextResponse.json(
            { error: 'Invalid time slot format' },
            { status: 400 }
          )
        }
      }
    }

    // Update availability
    await adminDb.collection('lawyers')
      .doc(params.id)
      .collection('availability')
      .doc('schedule')
      .set({
        schedule,
        updatedAt: new Date().toISOString()
      }, { merge: true })

    return NextResponse.json({
      message: 'Availability updated successfully'
    })

  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}