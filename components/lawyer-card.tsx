"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarIcon, MapPinIcon, CalendarIcon, MessageSquareIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { useRouter } from 'next/navigation'
import { Lawyer } from '@/types/lawyer'

interface LawyerCardProps {
  lawyer: Lawyer
  compact?: boolean
}

function LawyerCard({ lawyer, compact = false }: LawyerCardProps) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  // Handle booking click
  const handleBookingClick = () => {
    setIsBookingOpen(true)
  }

  if (compact) {
    return (
      <Link href={`/lawyers/${lawyer.id}`} className="block">
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={lawyer.photoURL} alt={lawyer.name} />
              <AvatarFallback>{getInitials(lawyer.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium text-sm truncate">{lawyer.name}</p>
              <p className="text-xs text-muted-foreground truncate">{lawyer.specialties?.join(', ') || ''}</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={lawyer.photoURL} alt={lawyer.name} />
              <AvatarFallback>{getInitials(lawyer.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">{lawyer.name}</h3>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm ml-1">
                    {lawyer.rating} ({lawyer.reviewCount})
                  </span>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate">
                  {lawyer.location && typeof lawyer.location === 'object' 
                    ? `${lawyer.location.city}, ${lawyer.location.state}`
                    : lawyer.location}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {lawyer.specialties?.slice(0, 3).map((specialization, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialization}
                  </Badge>
                ))}
                {lawyer.specialties && lawyer.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{lawyer.specialties.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
          {lawyer.bio}
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm">
            <p className="font-medium">{t('lawyer.consultation.fee')}</p>
            <p className="text-primary">{lawyer.hourlyRate} {t('lawyer.per.hour')}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/lawyers/${lawyer.id}`)}
              className="text-xs"
            >
              <MessageSquareIcon className="h-3 w-3 mr-1" />
              {t('lawyer.view.profile')}
            </Button>
            <Button 
              size="sm" 
              onClick={handleBookingClick}
              className="text-xs"
            >
              <CalendarIcon className="h-3 w-3 mr-1" />
              {t('lawyer.book')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LawyerCard
export { LawyerCard }