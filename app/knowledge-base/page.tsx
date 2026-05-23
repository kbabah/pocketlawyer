"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { useLanguage } from "@/contexts/language-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BookOpen, Loader2, Search, ArrowLeft } from "lucide-react"
import {
  getBuiltInKnowledgeCatalog,
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeEntry,
} from "@/lib/knowledge-base"

type CatalogItem = {
  id: string
  source: "builtin" | "uploaded"
  category: string
  title: string
  contentPreview: string
  tags: string[]
  jurisdiction?: string
  sourceRef?: string
}

export default function PublicKnowledgeBasePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [builtin, setBuiltin] = useState<CatalogItem[]>([])
  const [uploaded, setUploaded] = useState<CatalogItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState<"all" | "builtin" | "uploaded">("all")
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailTitle, setDetailTitle] = useState("")
  const [detailContent, setDetailContent] = useState("")
  const [detailMeta, setDetailMeta] = useState<{
    category: string
    jurisdiction?: string
    sourceRef?: string
    tags: string[]
  } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/knowledge-base")
        const data = await res.json()
        setBuiltin(data.builtin || [])
        setUploaded(data.uploaded || [])
      } catch {
        const catalog = getBuiltInKnowledgeCatalog()
        setBuiltin(
          catalog.map((entry) => ({
            id: entry.id,
            source: "builtin" as const,
            category: entry.category,
            title: entry.title,
            contentPreview:
              entry.content.length > 400
                ? `${entry.content.slice(0, 400)}…`
                : entry.content,
            tags: entry.tags,
            jurisdiction: entry.jurisdiction,
            sourceRef: entry.source,
          }))
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allItems = useMemo(() => {
    return [...builtin, ...uploaded]
  }, [builtin, uploaded])

  const filtered = useMemo(() => {
    let items = allItems
    if (sourceFilter !== "all") {
      items = items.filter((i) => i.source === sourceFilter)
    }
    if (categoryFilter !== "all") {
      items = items.filter((i) => i.category === categoryFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.contentPreview.toLowerCase().includes(q) ||
          i.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    }
    return items
  }, [allItems, sourceFilter, categoryFilter, searchQuery])

  const openDetail = async (item: CatalogItem) => {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailTitle(item.title)
    setDetailMeta({
      category: item.category,
      jurisdiction: item.jurisdiction,
      sourceRef: item.sourceRef,
      tags: item.tags || [],
    })

    try {
      if (item.source === "builtin") {
        const entry = getBuiltInKnowledgeCatalog().find((e) => e.id === item.id)
        setDetailContent(entry?.content || item.contentPreview)
      } else {
        const res = await fetch(
          `/api/knowledge-base/${item.id}?source=uploaded`
        )
        const data = await res.json()
        setDetailContent(data.entry?.content || item.contentPreview)
      }
    } catch {
      setDetailContent(item.contentPreview)
    } finally {
      setDetailLoading(false)
    }
  }

  const categoryLabel = (cat: string) =>
    KNOWLEDGE_CATEGORY_LABELS[cat as KnowledgeEntry["category"]] || cat

  return (
    <MainLayout
      title={t("kb.public.title")}
      subtitle={t("kb.public.subtitle")}
    >
      <div className="container max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Home")}
        </Button>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("kb.public.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("kb.public.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("kb.public.search")}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t("Category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("kb.public.all.categories")}</SelectItem>
              {Object.entries(KNOWLEDGE_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(v) =>
              setSourceFilter(v as "all" | "builtin" | "uploaded")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("kb.public.all.sources")}</SelectItem>
              <SelectItem value="builtin">{t("kb.public.builtin")}</SelectItem>
              <SelectItem value="uploaded">{t("kb.public.uploaded")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {t("kb.public.empty")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filtered.map((item) => (
              <Card
                key={`${item.source}-${item.id}`}
                className="cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => openDetail(item)}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <Badge variant="secondary">{categoryLabel(item.category)}</Badge>
                    <Badge variant="outline">
                      {item.source === "builtin"
                        ? t("kb.public.builtin")
                        : t("kb.public.uploaded")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.contentPreview}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailTitle}</DialogTitle>
          </DialogHeader>
          {detailMeta && (
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="secondary">
                {categoryLabel(detailMeta.category)}
              </Badge>
              {detailMeta.jurisdiction && (
                <Badge variant="outline">{detailMeta.jurisdiction}</Badge>
              )}
              {detailMeta.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {detailMeta?.sourceRef && (
            <p className="text-xs text-muted-foreground mb-2">
              {t("Source")}: {detailMeta.sourceRef}
            </p>
          )}
          {detailLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" />
          ) : (
            <pre className="text-sm whitespace-pre-wrap font-sans text-foreground/90">
              {detailContent}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
