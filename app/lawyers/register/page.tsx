"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Scale, Loader2, CheckCircle, X } from "lucide-react"
import { createLawyerRegistration } from "@/lib/services/lawyer-service"
import { SPECIALIZATIONS, LANGUAGES } from "@/types/lawyer"
import type { LawyerRegistrationData } from "@/types/lawyer"

export default function LawyerRegistrationPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState<LawyerRegistrationData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    barNumber: '',
    specializations: [],
    experience: 0,
    bio: '',
    education: [''],
    languages: [],
    hourlyRate: 5000,
    location: '',
    officeAddress: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error(t("Please sign in to register as a lawyer"))
      router.push("/sign-in")
      return
    }

    // Validation
    if (formData.specializations.length === 0) {
      toast.error(t("Please select at least one specialization"))
      return
    }

    if (formData.languages.length === 0) {
      toast.error(t("Please select at least one language"))
      return
    }

    if (!formData.barNumber) {
      toast.error(t("Bar number is required"))
      return
    }

    setLoading(true)

    try {
      await createLawyerRegistration(user.id, formData)
      setSubmitted(true)
      toast.success(t("Registration submitted successfully!"))
    } catch (error: any) {
      console.error("Error submitting registration:", error)
      toast.error(error.message || t("Failed to submit registration"))
    } finally {
      setLoading(false)
    }
  }

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }))
  }

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }))
  }

  const addEducationField = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, '']
    }))
  }

  const updateEducation = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? value : edu)
    }))
  }

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  if (submitted) {
    return (
      <MainLayout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("Registration Submitted!")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("Your lawyer registration has been submitted for review. Our admin team will review your application and get back to you within 2-3 business days.")}
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                {t("You will receive an email notification once your application is approved.")}
              </p>
              <Button onClick={() => router.push("/")}>
                {t("Return to Home")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("Register as a Lawyer")}</h1>
              <p className="text-muted-foreground">
                {t("Join our network of verified legal professionals")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Personal Information")}</CardTitle>
              <CardDescription>{t("Basic information about you")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t("Full Name")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("Email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">{t("Phone Number")} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="barNumber">{t("Bar Number")} *</Label>
                  <Input
                    id="barNumber"
                    placeholder="e.g., CM/BAR/2020/12345"
                    value={formData.barNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, barNumber: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">{t("City/Region")} *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Douala, Yaoundé"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">{t("Years of Experience")} *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="officeAddress">{t("Office Address")}</Label>
                <Textarea
                  id="officeAddress"
                  placeholder={t("Full office address")}
                  value={formData.officeAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, officeAddress: e.target.value }))}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Professional Information")}</CardTitle>
              <CardDescription>{t("Your legal expertise and background")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("Specializations")} *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("Select all areas of law you practice")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map(spec => (
                    <Badge
                      key={spec}
                      variant={formData.specializations.includes(spec) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSpecialization(spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t("Languages")} *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("Select languages you can consult in")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <Badge
                      key={lang}
                      variant={formData.languages.includes(lang) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLanguage(lang)}
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="bio">{t("Professional Bio")} *</Label>
                <Textarea
                  id="bio"
                  placeholder={t("Tell potential clients about your experience, approach, and why they should choose you...")}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={5}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length} characters
                </p>
              </div>

              <div>
                <Label>{t("Education & Qualifications")} *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("List your degrees, certifications, and qualifications")}
                </p>
                <div className="space-y-2">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={t("e.g., LLB from University of Yaoundé, 2015")}
                        value={edu}
                        onChange={(e) => updateEducation(index, e.target.value)}
                        required
                      />
                      {formData.education.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEducation(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducationField}
                  >
                    + {t("Add Another")}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="hourlyRate">{t("Consultation Fee (XAF per hour)")} *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="1000"
                  step="500"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 5000 }))}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("Recommended range: 5,000 - 50,000 XAF per hour")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Submitting...")}
                </>
              ) : (
                t("Submit Registration")
              )}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
