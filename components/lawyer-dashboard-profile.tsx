"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, Plus, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { toast } from 'sonner'

// This is a placeholder for actual API types
interface LawyerProfile {
  id: string
  name: string
  email: string
  photoUrl: string
  specializations: string[]
  bio: string
  location: string
  consultationFee: string
  barAssociationId: string
  yearsOfPractice: number
  education: string[]
  languages: string[]
}

const specializations = [
  'Family Law',
  'Criminal Law',
  'Corporate Law',
  'Real Estate Law',
  'Intellectual Property',
  'Tax Law',
  'Immigration Law',
  'Labor Law',
  'Environmental Law',
  'Constitutional Law'
]

const languages = [
  'English',
  'French',
  'Arabic',
  'Fulfulde',
  'Pidgin English'
]

export default function LawyerDashboardProfile() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [profile, setProfile] = useState<LawyerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSpecialization, setNewSpecialization] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    // In a real app this would fetch from your API
    const fetchProfile = async () => {
      try {
        // Mocked data for demonstration
        const mockedProfile: LawyerProfile = {
          id: '123',
          name: user?.name || 'Lawyer Name',
          email: user?.email || 'lawyer@example.com',
          photoUrl: user?.profileImage || '',
          specializations: ['Family Law', 'Criminal Law'],
          bio: 'Experienced lawyer with focus on family law cases.',
          location: 'Yaoundé, Cameroon',
          consultationFee: '20000 FCFA',
          barAssociationId: 'CAM12345',
          yearsOfPractice: 8,
          education: ['University of Yaoundé, LLB', 'Cameroon Bar School'],
          languages: ['English', 'French']
        }
        
        setProfile(mockedProfile)
      } catch (error) {
        console.error('Failed to load lawyer profile:', error)
        toast.error(t('lawyer.profile.load.error'))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, t])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return
    
    const { name, value } = e.target
    setProfile({
      ...profile,
      [name]: value
    })
  }

  const handleSpecializationChange = (value: string) => {
    setNewSpecialization(value)
  }

  const addSpecialization = () => {
    if (!profile || !newSpecialization || profile.specializations.includes(newSpecialization)) return
    
    setProfile({
      ...profile,
      specializations: [...profile.specializations, newSpecialization]
    })
    setNewSpecialization('')
  }

  const removeSpecialization = (item: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      specializations: profile.specializations.filter(s => s !== item)
    })
  }

  const handleLanguageChange = (value: string) => {
    setNewLanguage(value)
  }

  const addLanguage = () => {
    if (!profile || !newLanguage || profile.languages.includes(newLanguage)) return
    
    setProfile({
      ...profile,
      languages: [...profile.languages, newLanguage]
    })
    setNewLanguage('')
  }

  const removeLanguage = (item: string) => {
    if (!profile) return
    
    setProfile({
      ...profile,
      languages: profile.languages.filter(l => l !== item)
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageFile(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async () => {
    if (!imageFile) return
    
    setUploadingPhoto(true)
    try {
      // In a real app, this would be an API call to upload the image
      // const formData = new FormData()
      // formData.append('image', imageFile)
      // const response = await fetch('/api/lawyers/profile/image', {
      //   method: 'POST',
      //   body: formData
      // })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update profile with new image URL (in a real app, this would come from the API response)
      if (profile && imagePreview) {
        setProfile({
          ...profile,
          photoUrl: imagePreview
        })
      }
      
      toast.success(t('lawyer.photo.updated'))
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error(t('lawyer.photo.upload.error'))
    } finally {
      setUploadingPhoto(false)
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/lawyers/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile)
      // })
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(t('lawyer.profile.saved'))
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error(t('lawyer.profile.save.error'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">{t('lawyer.profile.not.found')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('lawyer.profile.title')}</CardTitle>
          <CardDescription>{t('lawyer.profile.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {imagePreview ? (
                <AvatarImage src={imagePreview} alt={profile.name} />
              ) : (
                <AvatarImage src={profile.photoUrl} alt={profile.name} />
              )}
              <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="photo">{t('lawyer.profile.photo')}</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="photo" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange} 
                />
                {imageFile && (
                  <Button 
                    size="sm"
                    onClick={uploadImage}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('lawyer.profile.name')}</Label>
            <Input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('lawyer.profile.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">{t('lawyer.profile.location')}</Label>
            <Input
              id="location"
              name="location"
              value={profile.location}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">{t('lawyer.profile.bio')}</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          
          {/* Professional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barAssociationId">{t('lawyer.profile.bar.id')}</Label>
              <Input
                id="barAssociationId"
                name="barAssociationId"
                value={profile.barAssociationId}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsOfPractice">{t('lawyer.profile.years')}</Label>
              <Input
                id="yearsOfPractice"
                name="yearsOfPractice"
                type="number"
                value={profile.yearsOfPractice.toString()}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="consultationFee">{t('lawyer.profile.fee')}</Label>
            <Input
              id="consultationFee"
              name="consultationFee"
              value={profile.consultationFee}
              onChange={handleInputChange}
            />
          </div>
          
          {/* Specializations */}
          <div className="space-y-2">
            <Label>{t('lawyer.profile.specializations')}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.specializations.map((item) => (
                <Badge key={item} variant="secondary" className="pr-1.5">
                  {item}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    onClick={() => removeSpecialization(item)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {item}</span>
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newSpecialization} onValueChange={handleSpecializationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('lawyer.profile.select.specialization')} />
                </SelectTrigger>
                <SelectContent>
                  {specializations
                    .filter(s => !profile.specializations.includes(s))
                    .map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Button type="button" onClick={addSpecialization} disabled={!newSpecialization}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add specialization</span>
              </Button>
            </div>
          </div>
          
          {/* Languages */}
          <div className="space-y-2">
            <Label>{t('lawyer.profile.languages')}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.languages.map((item) => (
                <Badge key={item} variant="secondary" className="pr-1.5">
                  {item}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    onClick={() => removeLanguage(item)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {item}</span>
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('lawyer.profile.select.language')} />
                </SelectTrigger>
                <SelectContent>
                  {languages
                    .filter(l => !profile.languages.includes(l))
                    .map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <Button type="button" onClick={addLanguage} disabled={!newLanguage}>
                <Plus className="h-4 w-4" />
                Add Language
              </Button>
            </div>
          </div>
          
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Profile Changes'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}