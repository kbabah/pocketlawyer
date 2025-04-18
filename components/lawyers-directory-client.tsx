"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { LawyerFilters, type LawyerFilters as LawyerFiltersType } from '@/components/lawyer-filters'
import { LawyerCard } from '@/components/lawyer-card'
import { Button } from '@/components/ui/button'
import { Lawyer } from '@/types/lawyer'
import Link from 'next/link'

interface LawyersDirectoryClientProps {
  initialLawyers: Lawyer[]
}

export function LawyersDirectoryClient({ initialLawyers }: LawyersDirectoryClientProps) {
  const [filters, setFilters] = useState<LawyerFiltersType>({
    specialization: [],
    location: [],
    language: [],
    consultationFee: [0, 100000],
    rating: 0,
    searchTerm: ''
  })

  const handleFilterChange = (newFilters: LawyerFiltersType) => {
    setFilters(newFilters)
  }

  const filteredLawyers = useMemo(() => {
    return initialLawyers.filter(lawyer => {
      // Filter by specialization
      if (filters.specialization.length > 0 && 
          !filters.specialization.some(spec => lawyer.specialties.includes(spec))) {
        return false
      }

      // Filter by location
      if (filters.location.length > 0 && 
          !filters.location.includes(`${lawyer.location.city}, ${lawyer.location.state}`)) {
        return false
      }

      // Filter by language
      if (filters.language.length > 0 && 
          !filters.language.some(lang => lawyer.languages.includes(lang))) {
        return false
      }

      // Filter by consultation fee
      if (lawyer.hourlyRate < filters.consultationFee[0] || 
          lawyer.hourlyRate > filters.consultationFee[1]) {
        return false
      }

      // Filter by rating
      if (filters.rating > 0 && (lawyer.rating || 0) < filters.rating) {
        return false
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        return (
          lawyer.name.toLowerCase().includes(searchLower) ||
          lawyer.bio.toLowerCase().includes(searchLower) ||
          lawyer.specialties.some(spec => spec.toLowerCase().includes(searchLower))
        )
      }

      return true
    })
  }, [initialLawyers, filters])

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
          {filteredLawyers.map((lawyer) => (
            <LawyerCard key={lawyer.id} lawyer={lawyer} />
          ))}
        </div>
        
        {filteredLawyers.length === 0 && (
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