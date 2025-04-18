import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Languages, Calendar, School, Briefcase, Award } from 'lucide-react';
import ConsultationBooking from '@/components/consultation-booking';

// This data will be used as fallback if the API fetch fails
const fallbackLawyers = [
  {
    id: "lawyer1",
    userId: "user1",
    name: "Jane Smith",
    email: "janesmith@example.com",
    photoURL: "/placeholder-user.jpg",
    bio: "Experienced attorney with 15+ years helping clients navigate complex family legal matters. I specialize in divorce, child custody, adoption, and estate planning. My approach focuses on finding amicable solutions while vigorously protecting my clients' interests when necessary. Prior to establishing my private practice, I worked at Smith & Associates, where I handled high-profile family law cases.",
    specialties: ["Family Law", "Estate Planning"],
    education: [
      {
        institution: "Harvard Law School",
        degree: "Juris Doctor (J.D.)",
        fieldOfStudy: "Law",
        from: "2005",
        to: "2008"
      },
      {
        institution: "University of California, Berkeley",
        degree: "Bachelor of Arts",
        fieldOfStudy: "Political Science",
        from: "2001",
        to: "2005"
      }
    ],
    barAdmissions: [
      {
        state: "California",
        year: 2008,
        barNumber: "245198",
        status: "active"
      },
      {
        state: "New York",
        year: 2010,
        barNumber: "5634821",
        status: "active"
      }
    ],
    experience: [
      {
        title: "Senior Partner",
        company: "Smith Family Law",
        location: "New York, NY",
        from: "2015",
        to: "Present",
        current: true,
        description: "Managing a boutique family law practice focused on high-net-worth divorce and complex custody arrangements."
      },
      {
        title: "Associate Attorney",
        company: "Johnson & Partners LLP",
        location: "New York, NY",
        from: "2010",
        to: "2015",
        current: false,
        description: "Handled family law cases including divorce, child custody, child support, and spousal support matters."
      }
    ],
    hourlyRate: 150,
    availability: {
      schedule: {
        monday: { available: true, slots: [
          { start: "09:00", end: "10:00", booked: false },
          { start: "10:00", end: "11:00", booked: true },
          { start: "14:00", end: "15:00", booked: false }
        ]},
        tuesday: { available: true, slots: [
          { start: "09:00", end: "10:00", booked: false },
          { start: "10:00", end: "11:00", booked: false }
        ]},
        wednesday: { available: true, slots: [
          { start: "13:00", end: "14:00", booked: false },
          { start: "14:00", end: "15:00", booked: false }
        ]},
        thursday: { available: true, slots: [
          { start: "11:00", end: "12:00", booked: false },
          { start: "15:00", end: "16:00", booked: false }
        ]},
        friday: { available: true, slots: [
          { start: "10:00", end: "11:00", booked: false },
          { start: "11:00", end: "12:00", booked: false }
        ]},
        saturday: { available: false, slots: [] },
        sunday: { available: false, slots: [] }
      }
    },
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
      virtualOnly: false
    },
    rating: 4.8,
    reviewCount: 47,
    languages: ["English", "Spanish"],
    verified: true,
    active: true,
    createdAt: "2023-01-15T14:22:31Z",
    updatedAt: "2023-04-10T09:15:42Z"
  },
  {
    id: "lawyer2",
    userId: "user2",
    name: "Robert Chen",
    email: "rchen@example.com",
    photoURL: "/placeholder-user.jpg",
    bio: "Corporate attorney specializing in startup law, IP protection, and business transactions. With over a decade of experience in Silicon Valley, I've helped numerous startups navigate the complexities of business formation, funding rounds, and intellectual property protection. My technical background in computer science allows me to better understand and serve clients in the technology sector.",
    specialties: ["Corporate Law", "Intellectual Property"],
    education: [
      {
        institution: "Stanford Law School",
        degree: "Juris Doctor (J.D.)",
        fieldOfStudy: "Law",
        from: "2008",
        to: "2011"
      },
      {
        institution: "MIT",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        from: "2004",
        to: "2008"
      }
    ],
    barAdmissions: [
      {
        state: "California",
        year: 2011,
        barNumber: "272555",
        status: "active"
      }
    ],
    experience: [
      {
        title: "Partner",
        company: "Tech Legal Partners",
        location: "San Francisco, CA",
        from: "2018",
        to: "Present",
        current: true,
        description: "Leading the startup practice, advising technology companies from formation through exit."
      },
      {
        title: "Corporate Counsel",
        company: "Innovate Inc.",
        location: "San Francisco, CA",
        from: "2014",
        to: "2018",
        current: false,
        description: "In-house counsel for a fast-growing SaaS company, managing legal affairs through two funding rounds and international expansion."
      }
    ],
    hourlyRate: 200,
    availability: {
      schedule: {
        monday: { available: true, slots: [
          { start: "11:00", end: "12:00", booked: false },
          { start: "15:00", end: "16:00", booked: false }
        ]},
        tuesday: { available: true, slots: [
          { start: "10:00", end: "11:00", booked: false },
          { start: "11:00", end: "12:00", booked: false }
        ]},
        wednesday: { available: false, slots: [] },
        thursday: { available: true, slots: [
          { start: "14:00", end: "15:00", booked: false },
          { start: "15:00", end: "16:00", booked: false }
        ]},
        friday: { available: true, slots: [
          { start: "09:00", end: "10:00", booked: false },
          { start: "10:00", end: "11:00", booked: false }
        ]},
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
    rating: 4.9,
    reviewCount: 32,
    languages: ["English", "Mandarin"],
    verified: true,
    active: true,
    createdAt: "2023-02-05T11:42:18Z",
    updatedAt: "2023-05-22T16:37:09Z"
  }
];

async function fetchLawyer(id: string) {
  try {
    // Fetch lawyer data from API
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/lawyers/${id}`, {
      cache: 'no-store', // Don't cache this data
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return null; // Return null for not found
      }
      throw new Error('Failed to fetch lawyer');
    }
    
    const lawyer = await res.json();
    return lawyer;
  } catch (error) {
    console.error('Error fetching lawyer:', error);
    // Try to find the lawyer in fallback data
    return fallbackLawyers.find(lawyer => lawyer.id === id) || null;
  }
}

type Props = {
  params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get lawyer ID from params
  const lawyerId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Fetch lawyer data
  const lawyer = await fetchLawyer(lawyerId);
  
  if (!lawyer) {
    return {
      title: 'Lawyer Not Found',
    };
  }
  
  return {
    title: `${lawyer.name} - Legal Consultation | Pocket Lawyer`,
    description: lawyer.bio.substring(0, 160),
  };
}

export default async function LawyerProfilePage({ params }: Props) {
  // Get lawyer ID from params
  const lawyerId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Fetch lawyer data
  const lawyer = await fetchLawyer(lawyerId);
  
  if (!lawyer) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lawyer Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                    <Image
                      src={lawyer.photoURL || "/placeholder-user.jpg"}
                      alt={lawyer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold">{lawyer.name}</h1>
                      <div className="flex items-center mt-1">
                        <MapPin size={16} className="mr-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {lawyer.location.city}, {lawyer.location.state}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(lawyer.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm">
                        {lawyer.rating} ({lawyer.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lawyer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <Languages size={16} className="mr-1 text-muted-foreground" />
                    <span className="text-sm">
                      {lawyer.languages.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="about">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <p className="whitespace-pre-line">{lawyer.bio}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Bar Admissions</h2>
                  <div className="space-y-4">
                    {lawyer.barAdmissions.map((admission, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{admission.state}</div>
                          <div className="text-sm text-muted-foreground">
                            Bar #{admission.barNumber} • Admitted {admission.year} • {admission.status === 'active' ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="experience" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
                  <div className="space-y-6">
                    {lawyer.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="flex items-start gap-3">
                          <Briefcase className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <div className="font-medium">{exp.title}</div>
                            <div className="text-sm">{exp.company}</div>
                            <div className="text-sm text-muted-foreground">
                              {exp.from} - {exp.to} • {exp.location}
                            </div>
                            <div className="mt-2">{exp.description}</div>
                          </div>
                        </div>
                        {index < lawyer.experience.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Education</h2>
                  <div className="space-y-6">
                    {lawyer.education.map((edu, index) => (
                      <div key={index}>
                        <div className="flex items-start gap-3">
                          <School className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <div className="font-medium">{edu.institution}</div>
                            <div className="text-sm">{edu.degree}</div>
                            <div className="text-sm text-muted-foreground">
                              {edu.from} - {edu.to} • {edu.fieldOfStudy}
                            </div>
                          </div>
                        </div>
                        {index < lawyer.education.length - 1 && <Separator className="my-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Client Reviews</h2>
                    <div className="flex items-center">
                      <div className="mr-2 text-2xl font-bold">{lawyer.rating}</div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={i < Math.floor(lawyer.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* In a real app, you'd map through actual reviews here */}
                  <div className="text-center py-6 text-muted-foreground">
                    Reviews coming soon
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Booking Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ConsultationBooking lawyer={lawyer} />
          </div>
        </div>
      </div>
    </div>
  );
}