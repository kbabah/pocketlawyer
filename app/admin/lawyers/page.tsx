"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Scale, Loader2, CheckCircle, XCircle, Eye, Mail, Phone, MapPin } from "lucide-react"
import { getPendingLawyers, approveLawyer, rejectLawyer } from "@/lib/services/lawyer-service"
import type { Lawyer } from "@/types/lawyer"
import { useRouter } from "next/navigation"

export default function AdminLawyersPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadPendingLawyers()
  }, [])

  const loadPendingLawyers = async () => {
    try {
      setLoading(true)
      const data = await getPendingLawyers()
      setLawyers(data)
    } catch (error: any) {
      console.error("Error loading pending lawyers:", error)
      toast.error(t("Failed to load pending lawyers"))
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (lawyer: Lawyer) => {
    if (!confirm(t("Are you sure you want to approve this lawyer?"))) {
      return
    }

    setActionLoading(true)
    try {
      await approveLawyer(lawyer.id)
      toast.success(t("Lawyer approved successfully!"))
      // Remove from list
      setLawyers(prev => prev.filter(l => l.id !== lawyer.id))
      setShowDetailsDialog(false)
    } catch (error: any) {
      console.error("Error approving lawyer:", error)
      toast.error(t("Failed to approve lawyer"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedLawyer || !rejectionReason.trim()) {
      toast.error(t("Please provide a rejection reason"))
      return
    }

    setActionLoading(true)
    try {
      await rejectLawyer(selectedLawyer.id, rejectionReason)
      toast.success(t("Lawyer registration rejected"))
      // Remove from list
      setLawyers(prev => prev.filter(l => l.id !== selectedLawyer.id))
      setShowRejectDialog(false)
      setShowDetailsDialog(false)
      setRejectionReason("")
    } catch (error: any) {
      console.error("Error rejecting lawyer:", error)
      toast.error(t("Failed to reject lawyer"))
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectDialog = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer)
    setShowRejectDialog(true)
  }

  const openDetailsDialog = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer)
    setShowDetailsDialog(true)
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
              <h1 className="text-3xl font-bold">{t("Lawyer Approvals")}</h1>
              <p className="text-muted-foreground">
                {t("Review and approve lawyer registrations")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{lawyers.length}</div>
              <p className="text-xs text-muted-foreground">
                {t("Pending Approvals")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Lawyers List */}
        {lawyers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {t("No pending lawyer registrations")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lawyers.map((lawyer) => (
              <Card key={lawyer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Basic Info */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{lawyer.name}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lawyer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lawyer.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lawyer.location}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">{t("Bar Number")}</p>
                        <p className="text-sm text-muted-foreground">{lawyer.barNumber}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">{t("Specializations")}</p>
                        <div className="flex flex-wrap gap-1">
                          {lawyer.specializations.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">{t("Languages")}</p>
                        <div className="flex flex-wrap gap-1">
                          {lawyer.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">{t("Experience")}</p>
                          <p className="font-medium">{lawyer.experience} {t("years")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t("Hourly Rate")}</p>
                          <p className="font-medium">{lawyer.hourlyRate.toLocaleString()} XAF</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2 md:w-48">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => openDetailsDialog(lawyer)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("View Details")}
                      </Button>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleApprove(lawyer)}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t("Approve")}
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => openRejectDialog(lawyer)}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t("Reject")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLawyer?.name}</DialogTitle>
              <DialogDescription>{t("Full lawyer profile details")}</DialogDescription>
            </DialogHeader>

            {selectedLawyer && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{t("Contact Information")}</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Email: {selectedLawyer.email}</p>
                    <p>Phone: {selectedLawyer.phone}</p>
                    <p>Location: {selectedLawyer.location}</p>
                    {selectedLawyer.officeAddress && (
                      <p>Office: {selectedLawyer.officeAddress}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("Professional Information")}</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>Bar Number: {selectedLawyer.barNumber}</p>
                    <p>Experience: {selectedLawyer.experience} years</p>
                    <p>Hourly Rate: {selectedLawyer.hourlyRate.toLocaleString()} XAF</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("Bio")}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedLawyer.bio}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("Education")}</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {selectedLawyer.education.map((edu, idx) => (
                      <li key={idx}>{edu}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("Specializations")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLawyer.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">{t("Languages")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLawyer.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                {t("Close")}
              </Button>
              <Button
                variant="default"
                onClick={() => selectedLawyer && handleApprove(selectedLawyer)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t("Approve")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedLawyer && openRejectDialog(selectedLawyer)}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t("Reject")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Reject Lawyer Registration")}</DialogTitle>
              <DialogDescription>
                {t("Please provide a reason for rejecting this registration")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">{t("Rejection Reason")} *</Label>
                <Textarea
                  id="reason"
                  placeholder={t("e.g., Invalid bar number, incomplete documentation...")}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason("")
                }}
                disabled={actionLoading}
              >
                {t("Cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("Rejecting...")}
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("Reject Registration")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
