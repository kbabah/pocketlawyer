"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRoleCheck } from "@/hooks/use-role-check"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  Scale, Loader2, CheckCircle, XCircle, Eye,
  ChevronLeft, MoreVertical, UserX, UserCheck, Search,
} from "lucide-react"
import {
  getAllLawyers, approveLawyer, rejectLawyer,
  suspendLawyer, reinstateLawyer,
} from "@/lib/services/lawyer-service"
import type { Lawyer } from "@/types/lawyer"
import { useRouter } from "next/navigation"

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "suspended"

export default function AdminLawyersPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { isAdmin } = useRoleCheck()

  const [loading, setLoading] = useState(true)
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([])
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [suspendReason, setSuspendReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    loadLawyers()
  }, [])

  useEffect(() => {
    let result = lawyers
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.barNumber?.toLowerCase().includes(q) ||
          l.location?.toLowerCase().includes(q)
      )
    }
    setFilteredLawyers(result)
  }, [lawyers, statusFilter, searchQuery])

  const loadLawyers = async () => {
    try {
      setLoading(true)
      const data = await getAllLawyers()
      setLawyers(data)
    } catch (error: any) {
      console.error("Error loading lawyers:", error)
      toast.error(t("Failed to load lawyers"))
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (lawyer: Lawyer) => {
    if (!confirm(t("Are you sure you want to approve this lawyer?"))) return
    setActionLoading(true)
    try {
      await approveLawyer(lawyer.id)
      toast.success(t("Lawyer approved successfully!"))
      setLawyers(prev => prev.map(l => l.id === lawyer.id ? { ...l, status: "approved" } : l))
      setShowDetailsDialog(false)
    } catch (error: any) {
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
      setLawyers(prev => prev.map(l => l.id === selectedLawyer.id ? { ...l, status: "rejected" } : l))
      setShowRejectDialog(false)
      setShowDetailsDialog(false)
      setRejectionReason("")
    } catch (error: any) {
      toast.error(t("Failed to reject lawyer"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspend = async () => {
    if (!selectedLawyer || !suspendReason.trim()) {
      toast.error(t("Please provide a suspension reason"))
      return
    }
    setActionLoading(true)
    try {
      await suspendLawyer(selectedLawyer.id, suspendReason)
      toast.success(t("Lawyer suspended"))
      setLawyers(prev => prev.map(l => l.id === selectedLawyer.id ? { ...l, status: "suspended" } : l))
      setShowSuspendDialog(false)
      setShowDetailsDialog(false)
      setSuspendReason("")
    } catch (error: any) {
      toast.error(t("Failed to suspend lawyer"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleReinstate = async (lawyer: Lawyer) => {
    if (!confirm(t("Reinstate this lawyer's account?"))) return
    setActionLoading(true)
    try {
      await reinstateLawyer(lawyer.id)
      toast.success(t("Lawyer reinstated successfully"))
      setLawyers(prev => prev.map(l => l.id === lawyer.id ? { ...l, status: "approved" } : l))
      setShowDetailsDialog(false)
    } catch (error: any) {
      toast.error(t("Failed to reinstate lawyer"))
    } finally {
      setActionLoading(false)
    }
  }

  const openDetailsDialog = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer)
    setShowDetailsDialog(true)
  }

  const openRejectDialog = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer)
    setShowRejectDialog(true)
  }

  const openSuspendDialog = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer)
    setShowSuspendDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "suspended":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const counts = {
    all: lawyers.length,
    pending: lawyers.filter(l => l.status === "pending").length,
    approved: lawyers.filter(l => l.status === "approved").length,
    rejected: lawyers.filter(l => l.status === "rejected").length,
    suspended: lawyers.filter(l => l.status === "suspended").length,
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
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("Back to Admin")}
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("Lawyer Management")}</h1>
              <p className="text-muted-foreground text-sm">
                {t("View, approve, reject, suspend and reinstate lawyers")}
              </p>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "pending", "approved", "rejected", "suspended"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search by name, email, bar number or location...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        {filteredLawyers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>{t("No lawyers found")}</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Name")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("Email")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("Bar #")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("Location")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell className="font-medium">{lawyer.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{lawyer.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{lawyer.barNumber}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{lawyer.location}</TableCell>
                    <TableCell>{getStatusBadge(lawyer.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDetailsDialog(lawyer)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("View Details")}
                          </DropdownMenuItem>
                          {lawyer.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(lawyer)}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                {t("Approve")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openRejectDialog(lawyer)}>
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                {t("Reject")}
                              </DropdownMenuItem>
                            </>
                          )}
                          {lawyer.status === "approved" && (
                            <DropdownMenuItem onClick={() => openSuspendDialog(lawyer)}>
                              <UserX className="h-4 w-4 mr-2 text-orange-600" />
                              {t("Suspend")}
                            </DropdownMenuItem>
                          )}
                          {lawyer.status === "suspended" && (
                            <DropdownMenuItem onClick={() => handleReinstate(lawyer)}>
                              <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                              {t("Reinstate")}
                            </DropdownMenuItem>
                          )}
                          {lawyer.status === "rejected" && (
                            <DropdownMenuItem onClick={() => handleApprove(lawyer)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              {t("Approve Anyway")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLawyer?.name}</DialogTitle>
              <DialogDescription>
                {selectedLawyer && getStatusBadge(selectedLawyer.status)}
              </DialogDescription>
            </DialogHeader>
            {selectedLawyer && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">{t("Contact")}</h4>
                  <p className="text-muted-foreground">Email: {selectedLawyer.email}</p>
                  <p className="text-muted-foreground">Phone: {selectedLawyer.phone}</p>
                  <p className="text-muted-foreground">Location: {selectedLawyer.location}</p>
                  {selectedLawyer.officeAddress && (
                    <p className="text-muted-foreground">Office: {selectedLawyer.officeAddress}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t("Professional")}</h4>
                  <p className="text-muted-foreground">Bar #: {selectedLawyer.barNumber}</p>
                  <p className="text-muted-foreground">Experience: {selectedLawyer.experience} yrs</p>
                  <p className="text-muted-foreground">Rate: {selectedLawyer.hourlyRate?.toLocaleString()} XAF/hr</p>
                </div>
                {selectedLawyer.bio && (
                  <div>
                    <h4 className="font-semibold mb-1">{t("Bio")}</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedLawyer.bio}</p>
                  </div>
                )}
                {selectedLawyer.education?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">{t("Education")}</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {selectedLawyer.education.map((edu, i) => <li key={i}>{edu}</li>)}
                    </ul>
                  </div>
                )}
                {selectedLawyer.specializations?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">{t("Specializations")}</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedLawyer.specializations.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(selectedLawyer as any).suspendedReason && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <p className="font-semibold text-red-800">{t("Suspension Reason")}</p>
                    <p className="text-red-700">{(selectedLawyer as any).suspendedReason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                {t("Close")}
              </Button>
              {selectedLawyer?.status === "pending" && (
                <>
                  <Button onClick={() => selectedLawyer && handleApprove(selectedLawyer)} disabled={actionLoading}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("Approve")}
                  </Button>
                  <Button variant="destructive" onClick={() => selectedLawyer && openRejectDialog(selectedLawyer)} disabled={actionLoading}>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t("Reject")}
                  </Button>
                </>
              )}
              {selectedLawyer?.status === "approved" && (
                <Button variant="destructive" onClick={() => selectedLawyer && openSuspendDialog(selectedLawyer)} disabled={actionLoading}>
                  <UserX className="h-4 w-4 mr-2" />
                  {t("Suspend")}
                </Button>
              )}
              {selectedLawyer?.status === "suspended" && (
                <Button onClick={() => selectedLawyer && handleReinstate(selectedLawyer)} disabled={actionLoading}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {t("Reinstate")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Reject Lawyer Registration")}</DialogTitle>
              <DialogDescription>
                {t("Provide a reason for rejecting this registration")}
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="rejection-reason">{t("Rejection Reason")} *</Label>
              <Textarea
                id="rejection-reason"
                placeholder={t("e.g., Invalid bar number, incomplete documentation...")}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason("") }} disabled={actionLoading}>
                {t("Cancel")}
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                {t("Reject")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Suspend Dialog */}
        <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Suspend Lawyer Account")}</DialogTitle>
              <DialogDescription>
                {t("Provide a reason for suspending this lawyer")}
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="suspend-reason">{t("Suspension Reason")} *</Label>
              <Textarea
                id="suspend-reason"
                placeholder={t("e.g., Client complaints, license revoked...")}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowSuspendDialog(false); setSuspendReason("") }} disabled={actionLoading}>
                {t("Cancel")}
              </Button>
              <Button variant="destructive" onClick={handleSuspend} disabled={actionLoading || !suspendReason.trim()}>
                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserX className="h-4 w-4 mr-2" />}
                {t("Suspend")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}