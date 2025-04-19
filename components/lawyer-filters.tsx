"use client"

import { useState, useCallback, useMemo } from 'react'
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
import { X, Filter, Loader2 } from 'lucide-react'

interface LawyerFiltersProps {
  onFilterChange: (filters: LawyerFilters) => void
  specializations?: string[]
  locations?: string[]
  languages?: string[]
  loading?: boolean
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
  languages = [],
  loading = false
}: LawyerFiltersProps) {
  const { t } = useLanguage()
  const [localFilters, setLocalFilters] = useState<LawyerFilters>({
    specialization: [],
    location: [],
    language: [],
    consultationFee: [0, 100000],
    rating: 0,
    searchTerm: ''
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const updateFilters = useCallback((updatedFilters: LawyerFilters) => {
    setLocalFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }, [onFilterChange])

  const handleCheckboxChange = useCallback((category: 'specialization' | 'location' | 'language', value: string) => {
    const currentValues = localFilters[category]
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    
    updateFilters({ ...localFilters, [category]: updatedValues })
  }, [localFilters, updateFilters])

  const handleFeeRangeChange = useCallback((values: number[]) => {
    updateFilters({ ...localFilters, consultationFee: [values[0], values[1]] })
  }, [localFilters, updateFilters])

  const handleRatingChange = useCallback((value: number[]) => {
    updateFilters({ ...localFilters, rating: value[0] })
  }, [localFilters, updateFilters])

  const handleSearch = useCallback(() => {
    updateFilters({ ...localFilters, searchTerm })
  }, [localFilters, searchTerm, updateFilters])

  const resetFilters = useCallback(() => {
    const resetValues: LawyerFilters = {
      specialization: [],
      location: [],
      language: [],
      consultationFee: [0, 100000],
      rating: 0,
      searchTerm: ''
    }
    setSearchTerm('')
    updateFilters(resetValues)
  }, [updateFilters])

  const activeFiltersCount = useMemo(() => 
    localFilters.specialization.length + 
    localFilters.location.length + 
    localFilters.language.length + 
    (localFilters.rating > 0 ? 1 : 0) +
    (localFilters.searchTerm ? 1 : 0) +
    ((localFilters.consultationFee[0] > 0 || localFilters.consultationFee[1] < 100000) ? 1 : 0),
    [localFilters]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder={t('Search by name, specialty, or keyword')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            disabled={loading}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSearch} 
            className="whitespace-nowrap"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('Filtering...')}
              </>
            ) : t('Search')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="sm:hidden"
            disabled={loading}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('Filters')}
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
          <h3 className="font-medium">{t('Refine Search')}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileFiltersOpen(false)}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {t(`${activeFiltersCount} active filter${activeFiltersCount === 1 ? '' : 's'}`)}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters} 
              className="h-8 text-xs"
              disabled={loading}
            >
              {t('Clear All')}
            </Button>
          </div>
        )}

        <Accordion type="multiple" defaultValue={['specialization', 'location', 'fee', 'rating']} className="space-y-2">
          <AccordionItem value="specialization">
            <AccordionTrigger className="py-2" disabled={loading}>
              {t('Practice Areas')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {specializations && specializations.length > 0 ? (
                  specializations.map((specialization) => (
                    <div key={specialization} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${specialization}`}
                        checked={localFilters.specialization.includes(specialization)}
                        onCheckedChange={() => handleCheckboxChange('specialization', specialization)}
                        disabled={loading}
                      />
                      <Label 
                        htmlFor={`spec-${specialization}`} 
                        className="text-sm cursor-pointer"
                      >
                        {specialization}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {t('No practice areas available')}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger className="py-2" disabled={loading}>
              {t('Location')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {locations && locations.length > 0 ? (
                  locations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`loc-${location}`}
                        checked={localFilters.location.includes(location)}
                        onCheckedChange={() => handleCheckboxChange('location', location)}
                        disabled={loading}
                      />
                      <Label 
                        htmlFor={`loc-${location}`} 
                        className="text-sm cursor-pointer"
                      >
                        {location}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {t('No locations available')}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="language">
            <AccordionTrigger className="py-2" disabled={loading}>
              {t('Languages Spoken')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {languages && languages.length > 0 ? (
                  languages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={localFilters.language.includes(language)}
                        onCheckedChange={() => handleCheckboxChange('language', language)}
                        disabled={loading}
                      />
                      <Label 
                        htmlFor={`lang-${language}`} 
                        className="text-sm cursor-pointer"
                      >
                        {language}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    {t('No languages available')}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fee">
            <AccordionTrigger className="py-2" disabled={loading}>
              {t('Consultation Fee Range')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{localFilters.consultationFee[0].toLocaleString()} FCFA</span>
                  <span className="text-sm">
                    {localFilters.consultationFee[1] === 100000 ? '100,000+ FCFA' : `${localFilters.consultationFee[1].toLocaleString()} FCFA`}
                  </span>
                </div>
                <Slider
                  defaultValue={[localFilters.consultationFee[0], localFilters.consultationFee[1]]}
                  min={0}
                  max={100000}
                  step={5000}
                  onValueChange={handleFeeRangeChange}
                  disabled={loading}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating">
            <AccordionTrigger className="py-2" disabled={loading}>
              {t('Minimum Rating')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {localFilters.rating > 0 ? `${localFilters.rating}+ Stars` : t('Any Rating')}
                  </span>
                </div>
                <Slider
                  defaultValue={[localFilters.rating]}
                  min={0}
                  max={5}
                  step={1}
                  onValueChange={handleRatingChange}
                  disabled={loading}
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