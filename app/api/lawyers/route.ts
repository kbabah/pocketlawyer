import { NextRequest, NextResponse } from 'next/server';
import { adminDb as db } from '@/lib/firebase-admin';
import { Lawyer } from '@/types/lawyer';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const specialties = searchParams.getAll('specialties[]'); // Allow multiple specialties
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Start with base query for active and verified lawyers
    let query = db.collection('lawyers')
      .where('active', '==', true)
      .where('verified', '==', true);
    
    // Add filters if provided
    if (specialties && specialties.length > 0) {
      // Use array-contains-any for multiple specialties (OR condition)
      query = query.where('specialties', 'array-contains-any', specialties);
    }
    
    if (language) {
      query = query.where('languages', 'array-contains', language);
    }
    
    // Execute the query
    const lawyersSnapshot = await query.limit(limit).offset(offset).get();
    
    let lawyers = lawyersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Lawyer[];
    
    // Apply location filters (client-side filtering since Firestore doesn't support nested field queries well)
    if (city || state || country) {
      lawyers = lawyers.filter(lawyer => {
        const matchCity = !city || lawyer.location.city.toLowerCase().includes(city.toLowerCase());
        const matchState = !state || lawyer.location.state.toLowerCase().includes(state.toLowerCase());
        const matchCountry = !country || lawyer.location.country.toLowerCase().includes(country.toLowerCase());
        return matchCity && matchState && matchCountry;
      });
    }

    // Add distance calculation if coordinates are provided
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    if (latitude && longitude) {
      const userLocation = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };

      lawyers = lawyers.map(lawyer => ({
        ...lawyer,
        distance: calculateDistance(
          userLocation,
          { 
            lat: lawyer.location.latitude || 0, 
            lng: lawyer.location.longitude || 0 
          }
        )
      })).sort((a, b) => ((a.distance || 0) - (b.distance || 0)));
    }
    
    return NextResponse.json({ 
      lawyers,
      meta: {
        total: lawyers.length,
        filtered: lawyers.length < lawyersSnapshot.docs.length,
        hasLocation: Boolean(latitude && longitude)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lawyers' },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}