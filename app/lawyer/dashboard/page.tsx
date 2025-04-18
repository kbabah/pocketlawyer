'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LawyerDashboardProfile } from '@/components/lawyer-dashboard-profile';
import { LawyerDashboardAvailability } from '@/components/lawyer-dashboard-availability';
import { LawyerDashboardConsultations } from '@/components/lawyer-dashboard-consultations';
import { LawyerDashboardReviews } from '@/components/lawyer-dashboard-reviews';
import { Sidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserCircle, Calendar, MessageSquare, Star, Settings, AlertCircle } from 'lucide-react';
import { Lawyer } from '@/types/lawyer';

export default function LawyerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [lawyerProfile, setLawyerProfile] = useState<Lawyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lawyer profile data
  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        // This would typically be fetched from an API based on the authenticated user
        const response = await fetch('/api/lawyers/me');
        
        if (!response.ok) {
          if (response.status === 404) {
            // Redirect to registration if lawyer profile doesn't exist
            router.push('/lawyer/register');
            return;
          }
          
          if (response.status === 401) {
            // Redirect to login if not authenticated
            router.push('/sign-in?redirect=/lawyer/dashboard');
            return;
          }
          
          throw new Error('Failed to fetch lawyer profile');
        }
        
        const data = await response.json();
        setLawyerProfile(data);
      } catch (error) {
        console.error('Error fetching lawyer profile:', error);
        setError('Failed to load your profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLawyerProfile();
  }, [router]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without refreshing page
    window.history.pushState({}, '', `/lawyer/dashboard?tab=${value}`);
  };

  // Set initial tab from URL query param on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'availability', 'consultations', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Define navigation items for the sidebar
  const sidebarNavItems = [
    {
      title: "Profile",
      value: "profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      title: "Availability",
      value: "availability",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Consultations",
      value: "consultations",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Reviews",
      value: "reviews",
      icon: <Star className="h-5 w-5" />,
    },
    {
      title: "Settings",
      value: "settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!lawyerProfile) {
    // This should not happen given the redirects in useEffect, but just in case
    router.push('/lawyer/register');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        {/* Sidebar for desktop */}
        <aside className="lg:w-1/5 hidden lg:block">
          <Sidebar className="sticky top-8">
            <nav className="flex flex-col space-y-1">
              {sidebarNavItems.map((item) => (
                <Button
                  key={item.value}
                  variant={activeTab === item.value ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleTabChange(item.value)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Button>
              ))}
            </nav>
          </Sidebar>
        </aside>
        
        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{lawyerProfile.name}'s Dashboard</h1>
            {!lawyerProfile.verified && (
              <Alert variant="warning" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Pending</AlertTitle>
                <AlertDescription>
                  Your profile is currently awaiting verification. Some features may be limited until your account is verified.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Mobile navigation */}
          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={handleTabChange}
            className="lg:hidden space-y-6"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Dashboard content */}
          <div className="space-y-8 mt-6">
            {activeTab === 'profile' && (
              <LawyerDashboardProfile lawyerProfile={lawyerProfile} />
            )}

            {activeTab === 'availability' && (
              <LawyerDashboardAvailability lawyerProfile={lawyerProfile} />
            )}

            {activeTab === 'consultations' && (
              <LawyerDashboardConsultations lawyerId={lawyerProfile.id} />
            )}

            {activeTab === 'reviews' && (
              <LawyerDashboardReviews lawyerId={lawyerProfile.id} />
            )}

            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Account settings features coming soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}