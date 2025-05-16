"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 sm:w-auto p-0 sm:p-2 flex items-center justify-center sm:justify-start gap-1 min-w-[32px]" 
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium uppercase hidden sm:inline">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={`${language === "en" ? "bg-primary/10 font-medium" : ""} py-2`}
        >
          {t("language.en")}
          {language === "en" && <span className="ml-2 text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("fr")}
          className={`${language === "fr" ? "bg-primary/10 font-medium" : ""} py-2`}
        >
          {t("language.fr")}
          {language === "fr" && <span className="ml-2 text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
