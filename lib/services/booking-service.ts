import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Booking, Review } from '@/types/lawyer'

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestampToDate(value: any): Date {
  if (value instanceof Date) {
    return value
  }
  if (value?.toDate && typeof value.toDate === 'function') {
    return value.toDate()
  }
  if (value?.seconds) {
    return new Date(value.seconds * 1000)
  }
  return new Date(value)
}

/**
 * Convert booking data from Firestore
 */
function convertBookingData(data: any): any {
  return {
    ...data,
    date: convertTimestampToDate(data.date),
    createdAt: data.createdAt ? convertTimestampToDate(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? convertTimestampToDate(data.updatedAt) : new Date(),
  }
}

/**
 * Create a new booking via API endpoint (uses Admin SDK to bypass permission issues)
 */
export async function createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // Get the current user's auth token
    const { auth } = await import('@/lib/firebase');
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User must be authenticated to create a booking');
    }

    const token = await user.getIdToken();

    // Call the API endpoint instead of directly writing to Firestore
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: bookingData.userId,
        userName: bookingData.userName,
        userEmail: bookingData.userEmail,
        lawyerId: bookingData.lawyerId,
        lawyerName: bookingData.lawyerName,
        lawyerEmail: bookingData.lawyerEmail,
        date: bookingData.date.toISOString(),
        duration: bookingData.duration,
        type: bookingData.type,
        status: bookingData.status || 'pending',
        totalAmount: bookingData.totalAmount,
        paymentStatus: bookingData.paymentStatus || 'pending',
        userPhone: bookingData.userPhone,
        notes: bookingData.notes,
        meetingLink: bookingData.meetingLink,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create booking: ${response.status}`);
    }

    const result = await response.json();
    return result.bookingId;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw new Error(error.message || 'Failed to create booking');
  }
}

/**
 * Get booking by ID
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const bookingRef = doc(db, 'bookings', bookingId)
  const bookingSnap = await getDoc(bookingRef)
  
  if (!bookingSnap.exists()) {
    return null
  }

  return {
    id: bookingSnap.id,
    ...convertBookingData(bookingSnap.data()),
  } as Booking
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertBookingData(doc.data()),
  } as Booking))
}

/**
 * Get lawyer's bookings via API (uses Admin SDK to bypass Firestore rules mismatch
 * where lawyerId in bookings is the Firestore doc ID, not the auth UID)
 */
export async function getLawyerBookings(_lawyerId: string): Promise<Booking[]> {
  const { auth } = await import('@/lib/firebase')
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const token = await user.getIdToken()
  const response = await fetch('/api/bookings/lawyer', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to fetch bookings')
  }

  const { bookings } = await response.json()
  return (bookings as any[]).map(b => ({
    ...b,
    date: new Date(b.date),
    createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
    updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date(),
  } as Booking))
}

/**
 * Get upcoming bookings for a lawyer (for availability check)
 */
export async function getLawyerUpcomingBookings(lawyerId: string): Promise<Booking[]> {
  const now = new Date()
  
  const q = query(
    collection(db, 'bookings'),
    where('lawyerId', '==', lawyerId),
    where('date', '>=', now),
    where('status', 'in', ['pending', 'confirmed']),
    orderBy('date', 'asc')
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertBookingData(doc.data()),
  } as Booking))
}

/**
 * Call a booking action via API (confirm / cancel / complete)
 */
async function callBookingAction(bookingId: string, body: object): Promise<void> {
  const { auth } = await import('@/lib/firebase')
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const token = await user.getIdToken()
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update booking')
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: Booking['status']
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId)
  
  await updateDoc(bookingRef, {
    status,
    updatedAt: new Date(),
  })
}

/**
 * Confirm booking
 */
export async function confirmBooking(bookingId: string, meetingLink?: string): Promise<void> {
  await callBookingAction(bookingId, { action: 'confirm', meetingLink })
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  bookingId: string,
  cancelledBy: 'user' | 'lawyer' | 'admin',
  reason: string
): Promise<void> {
  await callBookingAction(bookingId, { action: 'cancel', cancelledBy, reason })
}

/**
 * Complete booking
 */
export async function completeBooking(bookingId: string): Promise<void> {
  await callBookingAction(bookingId, { action: 'complete' })
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  bookingId: string,
  paymentStatus: Booking['paymentStatus'],
  paymentMethod?: string
): Promise<void> {
  const bookingRef = doc(db, 'bookings', bookingId)
  
  const updates: any = {
    paymentStatus,
    updatedAt: new Date(),
  }
  
  if (paymentMethod) {
    updates.paymentMethod = paymentMethod
  }
  
  await updateDoc(bookingRef, updates)
}

/**
 * Create a review
 */
export async function createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const reviewRef = doc(collection(db, 'reviews'))
  
  const review: Omit<Review, 'id'> = {
    ...reviewData,
    createdAt: new Date(),
  }

  await setDoc(reviewRef, review)
  return reviewRef.id
}

/**
 * Get reviews for a lawyer
 */
export async function getLawyerReviews(lawyerId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('lawyerId', '==', lawyerId),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Review))
}

/**
 * Get review for a booking
 */
export async function getBookingReview(bookingId: string): Promise<Review | null> {
  const q = query(
    collection(db, 'reviews'),
    where('bookingId', '==', bookingId)
  )
  
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as Review
}

/**
 * Check if time slot is available
 */
export async function isTimeSlotAvailable(
  lawyerId: string,
  date: Date,
  duration: number
): Promise<boolean> {
  const endTime = new Date(date.getTime() + duration * 60000)
  
  // Get all bookings for this lawyer on this day
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)
  
  const q = query(
    collection(db, 'bookings'),
    where('lawyerId', '==', lawyerId),
    where('date', '>=', dayStart),
    where('date', '<=', dayEnd),
    where('status', 'in', ['pending', 'confirmed'])
  )
  
  const snapshot = await getDocs(q)
  
  // Check if any existing booking overlaps
  for (const doc of snapshot.docs) {
    const booking = doc.data() as Booking
    const bookingStart = booking.date instanceof Date ? booking.date : new Date(booking.date)
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000)
    
    // Check for overlap
    if (
      (date >= bookingStart && date < bookingEnd) ||
      (endTime > bookingStart && endTime <= bookingEnd) ||
      (date <= bookingStart && endTime >= bookingEnd)
    ) {
      return false
    }
  }
  
  return true
}
