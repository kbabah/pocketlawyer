// Types for the Lawyer Booking System

export interface LawyerAvailability {
  monday: { available: boolean; hours: string[] }
  tuesday: { available: boolean; hours: string[] }
  wednesday: { available: boolean; hours: string[] }
  thursday: { available: boolean; hours: string[] }
  friday: { available: boolean; hours: string[] }
  saturday: { available: boolean; hours: string[] }
  sunday: { available: boolean; hours: string[] }
}

export interface LawyerDocuments {
  barCertificate?: string
  idCard?: string
  [key: string]: string | undefined
}

export interface Lawyer {
  id: string
  userId: string
  email: string
  name: string
  phone: string
  barNumber: string
  specializations: string[]
  experience: number
  bio: string
  education: string[]
  languages: string[]
  hourlyRate: number
  availability: LawyerAvailability
  profileImage?: string
  documents: LawyerDocuments
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  rating: number
  totalReviews: number
  totalConsultations: number
  createdAt: Date
  updatedAt: Date
  rejectionReason?: string
  suspendedReason?: string | null
  location?: string
  officeAddress?: string
}

export interface Booking {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  lawyerId: string
  lawyerName: string
  lawyerEmail: string
  date: Date
  duration: number // minutes (30, 60, 90)
  type: 'video' | 'phone' | 'in-person'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentMethod?: string
  notes?: string
  meetingLink?: string
  createdAt: Date
  updatedAt: Date
  cancelledBy?: 'user' | 'lawyer' | 'admin'
  cancellationReason?: string
}

export interface Review {
  id: string
  bookingId: string
  userId: string
  userName: string
  lawyerId: string
  rating: number // 1-5
  comment: string
  createdAt: Date
  helpful?: number // Number of users who found this helpful
}

export interface BookingFormData {
  date: string
  time: string
  duration: number
  type: 'video' | 'phone' | 'in-person'
  notes?: string
  userPhone?: string
}

export interface LawyerRegistrationData {
  name: string
  email: string
  phone: string
  barNumber: string
  specializations: string[]
  experience: number
  bio: string
  education: string[]
  languages: string[]
  hourlyRate: number
  location: string
  officeAddress: string
}

// Specialization options
export const SPECIALIZATIONS = [
  'Criminal Law',
  'Family Law',
  'Corporate Law',
  'Real Estate Law',
  'Labor Law',
  'Tax Law',
  'Immigration Law',
  'Intellectual Property',
  'Civil Litigation',
  'Contract Law',
  'Constitutional Law',
  'Environmental Law',
] as const

// Language options
export const LANGUAGES = [
  'English',
  'French',
  'Pidgin English',
  'Douala',
  'Fulfulde',
  'Ewondo',
] as const

// Duration options
export const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
] as const

// Consultation type options
export const CONSULTATION_TYPES = [
  { value: 'video', label: 'Video Call', icon: 'Video' },
  { value: 'phone', label: 'Phone Call', icon: 'Phone' },
  { value: 'in-person', label: 'In-Person Meeting', icon: 'Users' },
] as const
