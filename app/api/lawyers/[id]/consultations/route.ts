import { NextRequest, NextResponse } from 'next/server'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function GET(
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
    
    // Ensure the user is requesting their own consultations or is an admin
    if (decodedClaims.uid !== params.id && !decodedClaims.admin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get lawyer's consultations
    const consultationsSnapshot = await adminDb
      .collection('consultations')
      .where('lawyerId', '==', params.id)
      .orderBy('date', 'desc')
      .get()
    
    const consultations = []
    
    for (const doc of consultationsSnapshot.docs) {
      const consultation = doc.data()
      const clientDoc = await adminDb.collection('users').doc(consultation.clientId).get()
      const clientData = clientDoc.data()
      
      consultations.push({
        id: doc.id,
        ...consultation,
        clientName: clientData?.name || 'Anonymous',
        clientPhoto: clientData?.photoURL
      })
    }

    return NextResponse.json(consultations)

  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    )
  }
}