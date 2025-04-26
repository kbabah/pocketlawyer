"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"

export function ThemeSwitcher({ className = "", isWelcomePage = false }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  // Only show the theme switcher after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-8 w-8" />
  }

  // Create custom click handler to prevent event propagation
  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop event propagation completely
    e.stopPropagation();
    e.preventDefault();
    e.nativeEvent?.stopImmediatePropagation?.();
    
    // Toggle theme
    setTheme(theme === "dark" ? "light" : "dark");
    
    // Return false to prevent any further event bubbling
    return false;
  }
  
  // Create separate classes for welcome page vs app sidebar
  const baseClasses = "h-8 w-8 theme-switcher-btn";
  const welcomeClasses = isWelcomePage ? "welcome-theme-switcher pointer-events-auto" : "";
  const combinedClasses = `${baseClasses} ${welcomeClasses} ${className}`;

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
              zIndex: isWelcomePage ? 50 : 10, // Higher z-index on welcome page
              isolation: "isolate", // Create a new stacking context
              pointerEvents: "auto" // Ensure clicks are captured by this element only
            }}
            onClick={handleThemeToggle}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
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