"use client"

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { LawyerFilters, type LawyerFilters as LawyerFiltersType } from '@/components/lawyer-filters'
import { LawyerCard } from '@/components/lawyer-card'
import { Button } from '@/components/ui/button'
import { Lawyer } from '@/types/lawyer'
import Link from 'next/link'
import { useGeolocation } from '@/hooks/use-geolocation'

interface LawyersDirectoryClientProps {
  initialLawyers: Lawyer[]
}

type LawyerWithDistance = Lawyer & { distance?: number }

export function LawyersDirectoryClient({ initialLawyers }: LawyersDirectoryClientProps) {
  const [filters, setFilters] = useState<LawyerFiltersType>({
    specialization: [],
    location: [],
    language: [],
    consultationFee: [0, 100000],
    rating: 0,
    searchTerm: ''
  })
  const { coordinates, isLoading: locationLoading } = useGeolocation()
  const [lawyers, setLawyers] = useState<LawyerWithDistance[]>(initialLawyers)
  const [loading, setLoading] = useState(false)

  const handleFilterChange = useCallback(async (newFilters: LawyerFiltersType) => {
    setFilters(newFilters)
    setLoading(true)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      // Add specialty filters
      newFilters.specialization.forEach(spec => 
        params.append('specialties[]', spec)
      )

      // Add location filters
      if (newFilters.location.length > 0) {
        const [city, state] = newFilters.location[0].split(', ')
        if (city) params.append('city', city)
        if (state) params.append('state', state)
      }

      // Add language filter
      if (newFilters.language.length > 0) {
        params.append('language', newFilters.language[0])
      }

      // Add coordinates if available
      if (coordinates) {
        params.append('latitude', coordinates.latitude.toString())
        params.append('longitude', coordinates.longitude.toString())
      }

      // Fetch filtered lawyers
      const response = await fetch(`/api/lawyers?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch lawyers')
      
      const data = await response.json()
      setLawyers(data.lawyers)
    } catch (error) {
      console.error('Error fetching filtered lawyers:', error)
      // Fallback to client-side filtering
      const filtered = initialLawyers.filter(lawyer => {
        // Filter by specialization
        if (newFilters.specialization.length > 0 && 
            !newFilters.specialization.some(spec => lawyer.specialties.includes(spec))) {
          return false
        }

        // Filter by location
        if (newFilters.location.length > 0 && 
            !newFilters.location.includes(`${lawyer.location.city}, ${lawyer.location.state}`)) {
          return false
        }

        // Filter by language
        if (newFilters.language.length > 0 && 
            !newFilters.language.some(lang => lawyer.languages.includes(lang))) {
          return false
        }

        // Filter by consultation fee
        if (lawyer.hourlyRate < newFilters.consultationFee[0] || 
            lawyer.hourlyRate > newFilters.consultationFee[1]) {
          return false
        }

        // Filter by rating
        if (newFilters.rating > 0 && (lawyer.rating || 0) < newFilters.rating) {
          return false
        }

        // Filter by search term
        if (newFilters.searchTerm) {
          const searchLower = newFilters.searchTerm.toLowerCase()
          return (
            lawyer.name.toLowerCase().includes(searchLower) ||
            lawyer.bio.toLowerCase().includes(searchLower) ||
            lawyer.specialties.some(spec => spec.toLowerCase().includes(searchLower))
          )
        }

        return true
      })
      setLawyers(filtered)
    } finally {
      setLoading(false)
    }
  }, [initialLawyers, coordinates])

  // Extract unique values for filter options
  const specializations = useMemo(() => 
    Array.from(new Set(initialLawyers.flatMap(l => l.specialties))).sort(),
    [initialLawyers]
  )

  const locations = useMemo(() => 
    Array.from(new Set(initialLawyers.map(l => `${l.location.city}, ${l.location.state}`))).sort(),
    [initialLawyers]
  )

  const languages = useMemo(() => 
    Array.from(new Set(initialLawyers.flatMap(l => l.languages))).sort(),
    [initialLawyers]
  )

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <div className="w-full md:w-1/4 lg:w-1/5">
        <div className="sticky top-4">
          <LawyerFilters 
            onFilterChange={handleFilterChange}
            specializations={specializations}
            locations={locations}
            languages={languages}
            loading={loading || locationLoading}
          />
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
            <LawyerCard 
              key={lawyer.id} 
              lawyer={lawyer}
            />
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
  )
}