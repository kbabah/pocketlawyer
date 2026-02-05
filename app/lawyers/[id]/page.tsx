"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Scale, 
  Loader2, 
  Star, 
  MapPin, 
  DollarSign, 
  Languages as LanguagesIcon, 
  Briefcase,
  GraduationCap,
  Calendar,
  ArrowLeft,
  MessageSquare
} from "lucide-react"
import { getLawyer } from "@/lib/services/lawyer-service"
import { getLawyerReviews } from "@/lib/services/booking-service"
import type { Lawyer, Review } from "@/types/lawyer"

export default function LawyerProfilePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const lawyerId = params.id as string

  const [loading, setLoading] = useState(true)
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (lawyerId) {
      loadLawyerProfile()
      loadReviews()
    }
  }, [lawyerId])

  const loadLawyerProfile = async () => {
    try {
      setLoading(true)
      const data = await getLawyer(lawyerId)
      if (!data) {
        toast.error(t("Lawyer not found"))
        router.push("/lawyers")
        return
      }
      setLawyer(data)
    } catch (error: any) {
      console.error("Error loading lawyer:", error)
      toast.error(t("Failed to load lawyer profile"))
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const data = await getLawyerReviews(lawyerId)
      setReviews(data)
    } catch (error: any) {
      console.error("Error loading reviews:", error)
    }
  }

  const handleBookConsultation = () => {
    if (!user) {
      toast.error(t("Please sign in to book a consultation"))
      router.push("/sign-in")
      return
    }
    router.push(`/lawyers/${lawyerId}/book`)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!lawyer) {
    return null
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Lawyers")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <Scale className="h-16 w-16 text-primary" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{lawyer.name}</h1>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      {lawyer.rating > 0 ? (
                        <>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(lawyer.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{lawyer.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({lawyer.totalReviews} {t("reviews")})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">{t("No reviews yet")}</span>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{lawyer.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{lawyer.experience} {t("years")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{lawyer.totalConsultations} {t("consultations")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{lawyer.languages.length} {t("languages")}</span>
                      </div>
                    </div>

                    {/* Specializations */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">{t("Specializations")}</p>
                      <div className="flex flex-wrap gap-2">
                        {lawyer.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t("Languages")}</p>
                      <div className="flex flex-wrap gap-2">
                        {lawyer.languages.map((lang) => (
                          <Badge key={lang} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>{t("About")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {lawyer.bio}
                </p>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {t("Education & Qualifications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lawyer.education.map((edu, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{edu}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {t("Client Reviews")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t("No reviews yet")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-3xl font-bold">
                      {lawyer.hourlyRate.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">XAF/hr</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("Consultation fee")}
                  </p>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-medium mb-1">{t("Bar Number")}</p>
                    <p className="text-sm text-muted-foreground">{lawyer.barNumber}</p>
                  </div>

                  {lawyer.officeAddress && (
                    <div>
                      <p className="text-sm font-medium mb-1">{t("Office Address")}</p>
                      <p className="text-sm text-muted-foreground">{lawyer.officeAddress}</p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBookConsultation}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {t("Book Consultation")}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t("You won't be charged until the consultation is confirmed")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
