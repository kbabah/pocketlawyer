"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AvatarUpload } from "@/components/avatar-upload"
import { Loader2, Save, ArrowLeft, X } from "lucide-react"
import { toast } from "sonner"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Lawyer } from "@/types/lawyer"

const SPECIALTIES = [
  "Corporate Law",
  "Criminal Law",
  "Family Law",
  "Real Estate Law",
  "Immigration Law",
  "Labor Law",
  "Intellectual Property",
  "Tax Law",
  "Civil Litigation",
  "Constitutional Law"
]

export default function EditLawyerProfile() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [experience, setExperience] = useState("")
  const [education, setEducation] = useState("")
  const [barNumber, setBarNumber] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [languages, setLanguages] = useState<string[]>(["English", "French"])
  const [newLanguage, setNewLanguage] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
      return
    }
    loadLawyerProfile()
  }, [user])

  const loadLawyerProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      // Find lawyer profile associated with this user
      const lawyerDoc = await getDoc(doc(db, "lawyers", user.id))
      
      if (!lawyerDoc.exists()) {
        toast.error("Lawyer profile not found")
        router.push("/lawyer/dashboard")
        return
      }

      const data = lawyerDoc.data() as Lawyer
      setLawyer({ id: lawyerDoc.id, ...data })

      // Populate form
      setName(data.name || "")
      setEmail(data.email || "")
      setPhone(data.phone || "")
      setBio(data.bio || "")
      setSpecialties(data.specialties || [])
      setExperience(data.experience?.toString() || "")
      setEducation(data.education || "")
      setBarNumber(data.barNumber || "")
      setHourlyRate(data.hourlyRate?.toString() || "")
      setPhotoUrl(data.photoUrl || "")
      setLanguages(data.languages || ["English", "French"])
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!lawyer || !user) return

    // Validation
    if (!name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!phone.trim()) {
      toast.error("Phone is required")
      return
    }

    if (!bio.trim()) {
      toast.error("Bio is required")
      return
    }

    if (specialties.length === 0) {
      toast.error("Select at least one specialty")
      return
    }

    if (!experience || parseInt(experience) < 0) {
      toast.error("Valid experience is required")
      return
    }

    if (!hourlyRate || parseInt(hourlyRate) < 0) {
      toast.error("Valid hourly rate is required")
      return
    }

    setSaving(true)

    try {
      await updateDoc(doc(db, "lawyers", lawyer.id), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        specialties,
        experience: parseInt(experience),
        education: education.trim(),
        barNumber: barNumber.trim(),
        hourlyRate: parseInt(hourlyRate),
        photoUrl,
        languages,
        updatedAt: new Date(),
      })

      toast.success("Profile updated successfully!")
      router.push("/lawyer/dashboard")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()])
      setNewLanguage("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang))
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/lawyer/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">
            Update your professional information
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload a professional photo (max 2MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AvatarUpload
                currentUrl={photoUrl}
                userId={user?.id || ""}
                userType="lawyer"
                userName={name}
                onUploadComplete={setPhotoUrl}
                size="lg"
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barNumber">Bar Number</Label>
                  <Input
                    id="barNumber"
                    value={barNumber}
                    onChange={(e) => setBarNumber(e.target.value)}
                    placeholder="BAR123456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio *</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell potential clients about yourself..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length} / 500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Specialties * (Select all that apply)</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant={specialties.includes(specialty) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSpecialty(specialty)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (XAF) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="1000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="LL.B., University of Yaoundé I"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="gap-1">
                      {lang}
                      <button
                        onClick={() => removeLanguage(lang)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add language"
                    onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                  />
                  <Button onClick={addLanguage} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/lawyer/dashboard")}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
