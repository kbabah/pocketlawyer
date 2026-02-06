"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { 
  FileText, 
  FileEdit, 
  Scale, 
  Search, 
  BookOpen, 
  Users,
  Calendar,
  Plus
} from "lucide-react"
import { toast } from "sonner"

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  color?: string
}

export function QuickActions() {
  const { t } = useLanguage()
  const router = useRouter()
  const isMobile = useIsMobile()

  const quickActions: QuickAction[] = [
    {
      id: "analyze-document",
      label: t("Analyze Document"),
      icon: FileText,
      onClick: () => {
        router.push("/documents")
      },
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "draft-contract",
      label: t("Draft Contract"),
      icon: FileEdit,
      onClick: () => {
        toast.info(t("Contract drafting feature coming soon"))
      },
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      id: "legal-research",
      label: t("Legal Research"),
      icon: Search,
      onClick: () => {
        toast.info(t("Legal research feature coming soon"))
      },
      color: "text-green-600 dark:text-green-400"
    },
    {
      id: "case-review",
      label: t("Case Review"),
      icon: BookOpen,
      onClick: () => {
        toast.info(t("Case review feature coming soon"))
      },
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      id: "find-lawyer",
      label: t("Find a Lawyer"),
      icon: Scale,
      onClick: () => {
        router.push("/lawyers")
      },
      color: "text-indigo-600 dark:text-indigo-400"
    },
    {
      id: "book-consultation",
      label: t("Book Consultation"),
      icon: Calendar,
      onClick: () => {
        router.push("/lawyers")
      },
      color: "text-pink-600 dark:text-pink-400"
    },
  ]

  return (
    <div className="space-y-2">
      <div className={`px-2 ${isMobile ? 'py-2' : 'py-1'}`}>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="h-3 w-3" />
          {t("Quick Actions")}
        </h4>
      </div>
      
      <div className="grid grid-cols-2 gap-2 px-1">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto flex-col gap-1.5 ${
                isMobile 
                  ? 'py-3 px-2' 
                  : 'py-2.5 px-2'
              } hover:bg-secondary/80 transition-all duration-200 group`}
              onClick={action.onClick}
            >
              <Icon 
                className={`${action.color} ${
                  isMobile ? 'h-5 w-5' : 'h-4 w-4'
                } group-hover:scale-110 transition-transform`} 
              />
              <span className={`text-center leading-tight ${
                isMobile ? 'text-xs' : 'text-[10px]'
              }`}>
                {action.label}
              </span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
