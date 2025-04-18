"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/contexts/language-context'
import { X, Filter } from 'lucide-react'

interface LawyerFiltersProps {
  onFilterChange: (filters: LawyerFilters) => void
  specializations?: string[]
  locations?: string[]
  languages?: string[]
}

export interface LawyerFilters {
  specialization: string[]
  location: string[]
  language: string[]
  consultationFee: [number, number]
  rating: number
  searchTerm: string
}

function LawyerFilters({ 
  onFilterChange, 
  specializations = [], 
  locations = [], 
  languages = [] 
}: LawyerFiltersProps) {
  const { t } = useLanguage()
  const [filters, setFilters] = useState<LawyerFilters>({
    specialization: [],
    location: [],
    language: [],
    consultationFee: [0, 100000], // Default range in FCFA
    rating: 0,
    searchTerm: ''
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const handleCheckboxChange = (category: 'specialization' | 'location' | 'language', value: string) => {
    setFilters(prev => {
      const currentValues = prev[category]
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value]
      
      const updatedFilters = { ...prev, [category]: updatedValues }
      onFilterChange(updatedFilters)
      return updatedFilters
    })
  }

  const handleFeeRangeChange = (values: number[]) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, consultationFee: [values[0], values[1]] }
      onFilterChange(updatedFilters)
      return updatedFilters
    })
  }

  const handleRatingChange = (value: number[]) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, rating: value[0] }
      onFilterChange(updatedFilters)
      return updatedFilters
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters(prev => {
      const updatedFilters = { ...prev, searchTerm: value }
      onFilterChange(updatedFilters)
      return updatedFilters
    })
  }

  const resetFilters = () => {
    const resetValues: LawyerFilters = {
      specialization: [],
      location: [],
      language: [],
      consultationFee: [0, 100000],
      rating: 0,
      searchTerm: ''
    }
    
    setFilters(resetValues)
    onFilterChange(resetValues)
  }

  // Count active filters
  const activeFiltersCount = 
    filters.specialization.length + 
    filters.location.length + 
    filters.language.length + 
    (filters.rating > 0 ? 1 : 0) +
    (filters.searchTerm ? 1 : 0) +
    ((filters.consultationFee[0] > 0 || filters.consultationFee[1] < 100000) ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder={t('lawyer.search.placeholder')}
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('filters')}
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} sm:block bg-card sm:bg-transparent p-4 sm:p-0 rounded-md border sm:border-0`}>
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <h3 className="font-medium">{t('filters')}</h3>
          <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {t('active.filters', { count: activeFiltersCount })}
            </span>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
              {t('reset.filters')}
            </Button>
          </div>
        )}

        <Accordion type="multiple" defaultValue={['specialization', 'location', 'fee', 'rating']} className="space-y-2">
          <AccordionItem value="specialization">
            <AccordionTrigger className="py-2">{t('lawyer.filter.specialization')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {specializations && specializations.length > 0 ? (
                  specializations.map((specialization) => (
                    <div key={specialization} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${specialization}`}
                        checked={filters.specialization.includes(specialization)}
                        onCheckedChange={() => handleCheckboxChange('specialization', specialization)}
                      />
                      <Label htmlFor={`spec-${specialization}`} className="text-sm cursor-pointer">
                        {specialization}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {t('lawyer.filter.no.specializations') || 'No specializations available'}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger className="py-2">{t('lawyer.filter.location')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {locations && locations.length > 0 ? (
                  locations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`loc-${location}`}
                        checked={filters.location.includes(location)}
                        onCheckedChange={() => handleCheckboxChange('location', location)}
                      />
                      <Label htmlFor={`loc-${location}`} className="text-sm cursor-pointer">
                        {location}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {t('lawyer.filter.no.locations') || 'No locations available'}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="language">
            <AccordionTrigger className="py-2">{t('lawyer.filter.language')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {languages && languages.length > 0 ? (
                  languages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={filters.language.includes(language)}
                        onCheckedChange={() => handleCheckboxChange('language', language)}
                      />
                      <Label htmlFor={`lang-${language}`} className="text-sm cursor-pointer">
                        {language}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {t('lawyer.filter.no.languages') || 'No languages available'}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fee">
            <AccordionTrigger className="py-2">{t('lawyer.filter.fee')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{filters.consultationFee[0]} FCFA</span>
                  <span className="text-sm">
                    {filters.consultationFee[1] === 100000 ? '100,000+ FCFA' : `${filters.consultationFee[1]} FCFA`}
                  </span>
                </div>
                <Slider
                  defaultValue={[filters.consultationFee[0], filters.consultationFee[1]]}
                  min={0}
                  max={100000}
                  step={5000}
                  onValueChange={handleFeeRangeChange}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating">
            <AccordionTrigger className="py-2">{t('lawyer.filter.rating')}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {filters.rating > 0 ? `${filters.rating}+ ${t('lawyer.stars')}` : t('lawyer.any.rating')}
                  </span>
                </div>
                <Slider
                  defaultValue={[filters.rating]}
                  min={0}
                  max={5}
                  step={1}
                  onValueChange={handleRatingChange}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export default LawyerFilters
export { LawyerFilters }