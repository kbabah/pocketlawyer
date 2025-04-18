import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LawyerFilters } from '@/components/lawyer-filters';
import { LawyerCard } from '@/components/lawyer-card';
import { Button } from '@/components/ui/button';

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
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <div className="sticky top-4">
            <LawyerFilters />
            <div className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Are you a lawyer?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join our platform to connect with clients seeking legal advice in your area of expertise.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center pb-6">
                  <Link href="/lawyers/register">
                    <Button>Register as a Lawyer</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        <div className="w-full md:w-3/4 lg:w-4/5">
          <h1 className="text-3xl font-bold mb-6">Find a Lawyer</h1>
          
          <div className="mb-6">
            <p className="text-lg">
              Connect with experienced legal professionals for consultations on various legal matters.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))}
          </div>
          
          {lawyers.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No lawyers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}