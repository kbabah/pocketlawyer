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
  limit,
  Timestamp,
  increment,
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Lawyer, LawyerRegistrationData, LawyerAvailability } from '@/types/lawyer'

// Default availability (all days unavailable)
const DEFAULT_AVAILABILITY: LawyerAvailability = {
  monday: { available: false, hours: [] },
  tuesday: { available: false, hours: [] },
  wednesday: { available: false, hours: [] },
  thursday: { available: false, hours: [] },
  friday: { available: false, hours: [] },
  saturday: { available: false, hours: [] },
  sunday: { available: false, hours: [] },
}

/**
 * Create a new lawyer registration (pending approval)
 */
export async function createLawyerRegistration(
  userId: string,
  data: LawyerRegistrationData
): Promise<string> {
  const lawyerRef = doc(collection(db, 'lawyers'))
  
  const lawyerData: Omit<Lawyer, 'id'> = {
    userId,
    email: data.email,
    name: data.name,
    phone: data.phone,
    barNumber: data.barNumber,
    specializations: data.specializations,
    experience: data.experience,
    bio: data.bio,
    education: data.education,
    languages: data.languages,
    hourlyRate: data.hourlyRate,
    location: data.location,
    officeAddress: data.officeAddress,
    availability: DEFAULT_AVAILABILITY,
    documents: {},
    status: 'pending',
    rating: 0,
    totalReviews: 0,
    totalConsultations: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await setDoc(lawyerRef, lawyerData)
  return lawyerRef.id
}

/**
 * Get lawyer by ID
 */
export async function getLawyer(lawyerId: string): Promise<Lawyer | null> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  const lawyerSnap = await getDoc(lawyerRef)
  
  if (!lawyerSnap.exists()) {
    return null
  }

  return {
    id: lawyerSnap.id,
    ...lawyerSnap.data(),
  } as Lawyer
}

/**
 * Get lawyer by user ID
 */
export async function getLawyerByUserId(userId: string): Promise<Lawyer | null> {
  const q = query(
    collection(db, 'lawyers'),
    where('userId', '==', userId),
    limit(1)
  )
  
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as Lawyer
}

/**
 * Get all approved lawyers
 */
export async function getApprovedLawyers(): Promise<Lawyer[]> {
  const q = query(
    collection(db, 'lawyers'),
    where('status', '==', 'approved'),
    orderBy('rating', 'desc')
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Lawyer))
}

/**
 * Search lawyers by specialization
 */
export async function searchLawyersBySpecialization(specialization: string): Promise<Lawyer[]> {
  const q = query(
    collection(db, 'lawyers'),
    where('status', '==', 'approved'),
    where('specializations', 'array-contains', specialization),
    orderBy('rating', 'desc')
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Lawyer))
}

/**
 * Get ALL lawyers regardless of status (for admin)
 */
export async function getAllLawyers(): Promise<Lawyer[]> {
  const q = query(
    collection(db, 'lawyers'),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Lawyer))
}

/**
 * Suspend an approved lawyer (admin only)
 */
export async function suspendLawyer(lawyerId: string, reason: string): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  await updateDoc(lawyerRef, {
    status: 'suspended',
    suspendedReason: reason,
    updatedAt: new Date(),
  })
}

/**
 * Reinstate / activate a suspended lawyer (admin only)
 */
export async function reinstateLawyer(lawyerId: string): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  await updateDoc(lawyerRef, {
    status: 'approved',
    suspendedReason: null,
    updatedAt: new Date(),
  })
}

/**
 * Get pending lawyers (for admin)
 */
export async function getPendingLawyers(): Promise<Lawyer[]> {
  const q = query(
    collection(db, 'lawyers'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Lawyer))
}

/**
 * Approve lawyer (admin only)
 */
export async function approveLawyer(lawyerId: string): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  
  await updateDoc(lawyerRef, {
    status: 'approved',
    updatedAt: new Date(),
  })
}

/**
 * Reject lawyer (admin only)
 */
export async function rejectLawyer(lawyerId: string, reason: string): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  
  await updateDoc(lawyerRef, {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: new Date(),
  })
}

/**
 * Update lawyer profile
 */
export async function updateLawyerProfile(
  lawyerId: string,
  updates: Partial<Lawyer>
): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  
  await updateDoc(lawyerRef, {
    ...updates,
    updatedAt: new Date(),
  })
}

/**
 * Update lawyer availability
 */
export async function updateLawyerAvailability(
  lawyerId: string,
  availability: LawyerAvailability
): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  
  await updateDoc(lawyerRef, {
    availability,
    updatedAt: new Date(),
  })
}

/**
 * Increment lawyer's total consultations
 */
export async function incrementLawyerConsultations(lawyerId: string): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  
  await updateDoc(lawyerRef, {
    totalConsultations: increment(1),
    updatedAt: new Date(),
  })
}

/**
 * Update lawyer rating after review
 */
export async function updateLawyerRating(
  lawyerId: string,
  newRating: number
): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  const lawyer = await getLawyer(lawyerId)
  
  if (!lawyer) return

  const totalReviews = lawyer.totalReviews + 1
  const currentTotal = lawyer.rating * lawyer.totalReviews
  const newTotal = currentTotal + newRating
  const avgRating = newTotal / totalReviews

  await updateDoc(lawyerRef, {
    rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    totalReviews,
    updatedAt: new Date(),
  })
}

/**
 * Upload lawyer document URL
 */
export async function uploadLawyerDocument(
  lawyerId: string,
  documentType: string,
  documentUrl: string
): Promise<void> {
  const lawyerRef = doc(db, 'lawyers', lawyerId)
  
  await updateDoc(lawyerRef, {
    [`documents.${documentType}`]: documentUrl,
    updatedAt: new Date(),
  })
}
