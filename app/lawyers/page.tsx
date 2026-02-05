"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Scale, Search, Loader2, Star, MapPin, DollarSign, Languages as LanguagesIcon, Briefcase } from "lucide-react"
import { getApprovedLawyers, searchLawyersBySpecialization } from "@/lib/services/lawyer-service"
import type { Lawyer } from "@/types/lawyer"
import { SPECIALIZATIONS } from "@/types/lawyer"

export default function LawyersPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all")

  useEffect(() => {
    loadLawyers()
  }, [])

  useEffect(() => {
    filterLawyers()
  }, [searchQuery, selectedSpecialization, lawyers])

  const loadLawyers = async () => {
    try {
      setLoading(true)
      const data = await getApprovedLawyers()
      setLawyers(data)
      setFilteredLawyers(data)
    } catch (error: any) {
      console.error("Error loading lawyers:", error)
      toast.error(t("Failed to load lawyers"))
    } finally {
      setLoading(false)
    }
  }

  const filterLawyers = () => {
    let filtered = [...lawyers]

    // Filter by specialization
    if (selectedSpecialization !== "all") {
      filtered = filtered.filter(lawyer =>
        lawyer.specializations.includes(selectedSpecialization)
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(lawyer =>
        lawyer.name.toLowerCase().includes(query) ||
        lawyer.location.toLowerCase().includes(query) ||
        lawyer.specializations.some(spec => spec.toLowerCase().includes(query)) ||
        lawyer.bio.toLowerCase().includes(query)
      )
    }

    setFilteredLawyers(filtered)
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

  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("Find a Lawyer")}</h1>
              <p className="text-muted-foreground">
                {t("Browse verified legal professionals in Cameroon")}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search by name, location, or keywords...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Specialization Filter */}
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder={t("All Specializations")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Specializations")}</SelectItem>
                {SPECIALIZATIONS.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredLawyers.length === lawyers.length
              ? t(`Showing all ${lawyers.length} lawyers`)
              : t(`${filteredLawyers.length} of ${lawyers.length} lawyers`)}
          </div>
        </div>

        {/* Lawyers Grid */}
        {filteredLawyers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">
                {t("No lawyers found")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("Try adjusting your search or filters")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <Card
                key={lawyer.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/lawyers/${lawyer.id}`)}
              >
                <CardContent className="p-6">
                  {/* Profile Image Placeholder */}
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <Scale className="h-10 w-10 text-primary" />
                    </div>
                  </div>

                  {/* Name & Rating */}
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {lawyer.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-sm">
                      {lawyer.rating > 0 ? (
                        <>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{lawyer.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({lawyer.totalReviews} {t("reviews")})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">{t("No reviews yet")}</span>
                      )}
                    </div>
                  </div>

                  {/* Location & Experience */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{lawyer.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span>{lawyer.experience} {t("years experience")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      <span>{lawyer.hourlyRate.toLocaleString()} XAF/hr</span>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {t("Specializations")}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.specializations.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {lawyer.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{lawyer.specializations.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <LanguagesIcon className="h-3 w-3" />
                      <span>{lawyer.languages.join(", ")}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full" size="sm">
                    {t("View Profile & Book")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
