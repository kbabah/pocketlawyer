"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"

export function ThemeSwitcher({ className = "", isWelcomePage = false }) {
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()
  // Initialize theme context with a default value to prevent undefined
  const { theme = 'system', setTheme } = useTheme() || { theme: 'system', setTheme: () => {} }

  // Only show the theme switcher after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-8 w-8" />
  }

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setTheme(theme === "dark" ? "light" : "dark")
    return false
  }

  const baseClasses = "h-9 w-9 sm:h-8 sm:w-8 theme-switcher-btn"
  const welcomeClasses = isWelcomePage ? "welcome-theme-switcher pointer-events-auto" : ""
  const combinedClasses = `${baseClasses} ${welcomeClasses} ${className}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={combinedClasses}
            style={{ 
              position: "relative", 
              zIndex: isWelcomePage ? 50 : 10,
              isolation: "isolate",
              pointerEvents: "auto"
            }}
            onClick={handleThemeToggle}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            aria-label={theme === "dark" ? t("theme.switch.light") || "Switch to light theme" : t("theme.switch.dark") || "Switch to dark theme"}
            data-theme-switcher
            data-welcome-page={isWelcomePage ? "true" : "false"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">
              {theme === "dark" ? t("theme.switch.light") : t("theme.switch.dark")}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {theme === "dark"
              ? t("theme.switch.light") || "Switch to light theme"
              : t("theme.switch.dark") || "Switch to dark theme"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}