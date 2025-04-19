import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb as db } from '@/lib/firebase-admin';

// Sample lawyer data for testing
const sampleLawyer = {
  id: "sample-lawyer-1",
  userId: "test-user-id",
  name: "Adv. Sarah Johnson",
  email: "sarah.johnson@example.com",
  photoURL: "/placeholder-user.jpg",
  bio: "Experienced attorney with over 15 years of practice in corporate and intellectual property law. Specialized in helping startups and tech companies navigate legal challenges in the digital age.",
  specialties: ["Corporate Law", "Intellectual Property", "Technology Law", "Startup Law"],
  education: [
    {
      institution: "Harvard Law School",
      degree: "Juris Doctor (J.D.)",
      fieldOfStudy: "Law",
      from: "2005",
      to: "2008"
    },
    {
      institution: "Massachusetts Institute of Technology",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      from: "2001",
      to: "2005"
    }
  ],
  barAdmissions: [
    {
      state: "California",
      year: 2008,
      barNumber: "SBN123456",
      status: "active"
    },
    {
      state: "New York",
      year: 2009,
      barNumber: "NY987654",
      status: "active"
    }
  ],
  experience: [
    {
      title: "Senior Partner",
      company: "Tech Law Partners LLP",
      location: "San Francisco, CA",
      from: "2015",
      to: "Present",
      current: true,
      description: "Leading the technology and startup practice, handling complex IP litigation and corporate transactions for major tech companies."
    },
    {
      title: "Associate Attorney",
      company: "Global Law Group",
      location: "New York, NY",
      from: "2008",
      to: "2015",
      current: false,
      description: "Specialized in intellectual property law, patent litigation, and technology licensing."
    }
  ],
  hourlyRate: 300,
  availability: {
    schedule: {
      monday: {
        available: true,
        slots: [
          { start: "09:00", end: "10:00", booked: false },
          { start: "10:30", end: "11:30", booked: false },
          { start: "14:00", end: "15:00", booked: false },
          { start: "15:30", end: "16:30", booked: false }
        ]
      },
      tuesday: {
        available: true,
        slots: [
          { start: "09:00", end: "10:00", booked: false },
          { start: "10:30", end: "11:30", booked: false },
          { start: "14:00", end: "15:00", booked: false }
        ]
      },
      wednesday: {
        available: true,
        slots: [
          { start: "13:00", end: "14:00", booked: false },
          { start: "14:30", end: "15:30", booked: false },
          { start: "16:00", end: "17:00", booked: false }
        ]
      },
      thursday: {
        available: true,
        slots: [
          { start: "09:00", end: "10:00", booked: false },
          { start: "10:30", end: "11:30", booked: false }
        ]
      },
      friday: {
        available: true,
        slots: [
          { start: "14:00", end: "15:00", booked: false },
          { start: "15:30", end: "16:30", booked: false }
        ]
      },
      saturday: { available: false, slots: [] },
      sunday: { available: false, slots: [] }
    }
  },
  location: {
    city: "San Francisco",
    state: "CA",
    country: "USA",
    virtualOnly: false
  },
  rating: 4.8,
  reviewCount: 47,
  languages: ["English", "Spanish", "Mandarin"],
  verified: true,
  active: true,
  createdAt: "2023-01-15T08:00:00Z",
  updatedAt: "2023-04-01T16:30:00Z"
};

export async function GET(request: NextRequest) {
  try {
    // For testing purposes, always return the sample lawyer
    return NextResponse.json(sampleLawyer);

    // In production, you would:
    // 1. Verify authentication
    // 2. Get the user's ID
    // 3. Query Firestore for the actual lawyer profile
    // 4. Return the real data or 404 if not found
  } catch (error: any) {
    console.error('Error fetching lawyer profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lawyer profile' },
      { status: 500 }
    );
  }
}