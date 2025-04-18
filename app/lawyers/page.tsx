import { Metadata } from 'next';
import { LawyersDirectoryClient } from '@/components/lawyers-directory-client';

export const metadata: Metadata = {
  title: 'Find a Lawyer | Pocket Lawyer',
  description: 'Connect with experienced legal professionals for consultations on various legal matters.',
};

// This data will be used as fallback if the API fetch fails
const fallbackLawyers = [
  {
    id: "lawyer1",
    name: "Jane Smith",
    photoURL: "/placeholder-user.jpg",
    specialties: ["Family Law", "Estate Planning"],
    bio: "Experienced attorney with 15+ years helping clients navigate complex family legal matters.",
    hourlyRate: 150,
    rating: 4.8,
    reviewCount: 47,
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
    },
    languages: ["English", "Spanish"],
  },
  {
    id: "lawyer2",
    name: "Robert Chen",
    photoURL: "/placeholder-user.jpg",
    specialties: ["Corporate Law", "Intellectual Property"],
    bio: "Corporate attorney specializing in startup law, IP protection, and business transactions.",
    hourlyRate: 200,
    rating: 4.9,
    reviewCount: 32,
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
    },
    languages: ["English", "Mandarin"],
  },
  {
    id: "lawyer3",
    name: "Maria Rodriguez",
    photoURL: "/placeholder-user.jpg",
    specialties: ["Immigration Law", "Civil Rights"],
    bio: "Dedicated immigration attorney helping individuals and families achieve their American dream.",
    hourlyRate: 175,
    rating: 5.0,
    reviewCount: 28,
    location: {
      city: "Chicago",
      state: "IL",
      country: "USA",
    },
    languages: ["English", "Spanish", "Portuguese"],
  },
];

async function fetchLawyers() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/lawyers`, {
      cache: 'no-store', // Don't cache this data
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch lawyers');
    }
    
    const data = await res.json();
    return data.lawyers || [];
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return fallbackLawyers; // Use fallback data if API fails
  }
}

export default async function LawyersDirectoryPage() {
  const lawyers = await fetchLawyers();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <LawyersDirectoryClient initialLawyers={lawyers} />
    </div>
  );
}