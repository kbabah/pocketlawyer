export interface Lawyer {
  id: string;
  userId: string; // Firebase auth ID
  name: string;
  email: string;
  photoURL?: string;
  bio: string;
  specialties: string[]; // e.g., ["Family Law", "Criminal Defense"]
  education: Education[];
  barAdmissions: BarAdmission[];
  experience: Experience[];
  hourlyRate: number;
  availability: Availability;
  location: Location;
  rating?: number;
  reviewCount?: number;
  languages: string[];
  verified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  from: string;
  to: string;
}

export interface BarAdmission {
  state: string;
  year: number;
  barNumber: string;
  status: 'active' | 'inactive';
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  from: string;
  to: string;
  current: boolean;
  description: string;
}

export interface Availability {
  schedule: {
    [key: string]: { // day of week (monday, tuesday, etc.)
      available: boolean;
      slots: TimeSlot[];
    }
  }
}

export interface TimeSlot {
  start: string; // "09:00", "14:30", etc.
  end: string;
  booked: boolean;
}

export interface Location {
  address?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  virtualOnly: boolean;
}

export interface Consultation {
  id: string;
  lawyerId: string;
  clientId: string; // userId of the client
  subject: string;
  description: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'completed' | 'refunded';
  paymentAmount: number;
  paymentId?: string;
  notes?: string;
  documents?: string[]; // URLs to relevant documents
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  lawyerId: string;
  clientId: string;
  consultationId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}