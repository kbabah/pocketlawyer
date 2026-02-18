"use client"

import React, { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useRoleCheck } from "@/hooks/use-role-check"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Database, Plus, Trash2, Save, Loader2, BookOpen, Search
} from "lucide-react"
import { toast } from "sonner"
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface KBEntry {
  id: string
  category: string
  title: string
  content: string
  tags: string[]
  jurisdiction: string
  source: string
  createdAt?: any
}

const CATEGORIES = [
  { value: "statute", label: "Statute / Law" },
  { value: "case_law", label: "Case Law / Jurisprudence" },
  { value: "procedure", label: "Legal Procedure" },
  { value: "contract_template", label: "Contract Template" },
  { value: "legal_principle", label: "Legal Principle" },
  { value: "regulation", label: "Regulation / Decree" },
]

export default function KnowledgeBasePage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { isAdmin } = useRoleCheck()
  const router = useRouter()
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [jurisdiction, setJurisdiction] = useState("Cameroon - National")
  const [source, setSource] = useState("")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    fetchEntries()
  }, [isAdmin, router])

  const fetchEntries = async () => {
    try {
      const q = query(collection(db, "knowledge_base"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      setEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as KBEntry)))
    } catch (error) {
      console.error("Error fetching KB:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title || !category || !content) {
      toast.error(t("Please fill in title, category, and content"))
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, "knowledge_base"), {
        title,
        category,
        content,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        jurisdiction,
        source,
        createdAt: serverTimestamp(),
        createdBy: user?.id,
      })
      toast.success(t("Knowledge base entry added"))
      setTitle("")
      setCategory("")
      setContent("")
      setTags("")
      setSource("")
      fetchEntries()
    } catch (error) {
      console.error("Error saving KB entry:", error)
      toast.error(t("Failed to save entry"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("Delete this entry?"))) return
    try {
      await deleteDoc(doc(db, "knowledge_base", id))
      toast.success(t("Entry deleted"))
      fetchEntries()
    } catch (error) {
      console.error("Error deleting KB entry:", error)
      toast.error(t("Failed to delete"))
    }
  }

  const filteredEntries = searchQuery
    ? entries.filter(e => {
        const q = searchQuery.toLowerCase()
        return (
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags?.some(t => t.toLowerCase().includes(q))
        )
      })
    : entries

  if (!isAdmin) return null

  const breadcrumbs = [
    { label: t("Home"), href: "/" },
    { label: t("Admin"), href: "/admin" },
    { label: t("Knowledge Base"), href: "/admin/knowledge-base", isCurrentPage: true },
  ]

  return (
    <MainLayout
      breadcrumbs={breadcrumbs}
      title={t("Knowledge Base Management")}
      subtitle={t("Add and manage offline legal resources")}
    >
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("Knowledge Base")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("Add legal resources that will be available offline to enhance AI responses")}
            </p>
          </div>
        </div>

        {/* Built-in KB Info */}
        <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">{t("Built-in Knowledge Base Active")}</p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {t("The system includes built-in Cameroonian legal resources covering: Constitution, OHADA Uniform Acts, Labour Code, Penal Code, Land Tenure, Family Law, Tax Law, Court System, Business Registration, and 5 contract templates. These are always available without internet.")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add New Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t("Add New Entry")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("Title")} *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mining Code of Cameroon"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Category")} *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("Content")} *</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Full text of the legal resource..."
                className="min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("Tags")} ({t("comma-separated")})</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="land, property, registration"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Jurisdiction")}</Label>
                <Input
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Source")}</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Law No. 2024/XXX"
                />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t("Save Entry")}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Entries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              {t("Uploaded Resources")} ({filteredEntries.length})
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Search entries...")}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {searchQuery
                  ? t("No entries match your search.")
                  : t("No uploaded resources yet. The built-in knowledge base is always active.")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map(entry => (
                <Card key={entry.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{entry.title}</p>
                        <Badge variant="secondary">{entry.category}</Badge>
                        {entry.jurisdiction && (
                          <Badge variant="outline" className="text-xs">{entry.jurisdiction}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>
                      {entry.source && (
                        <p className="text-xs text-muted-foreground mt-1">Source: {entry.source}</p>
                      )}
                      {entry.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 flex-shrink-0"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
