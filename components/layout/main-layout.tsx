"use client"

import React, { ReactNode, Suspense } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemeLogo } from "@/components/theme-logo"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface MainLayoutProps {
  children: ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
    isCurrentPage?: boolean
  }>
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
  showSidebar?: boolean
}

// Loading skeleton component
const HeaderSkeleton = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <Skeleton className="h-8 w-8" />
    <Skeleton className="h-6 w-32" />
  </div>
)

// Optimized header component
const Header = React.memo(({ 
  breadcrumbs, 
  title, 
  subtitle, 
  actions 
}: Pick<MainLayoutProps, 'breadcrumbs' | 'title' | 'subtitle' | 'actions'>) => {
  const { t } = useLanguage()
  const { user } = useAuth()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
          <SidebarTrigger className="-ml-1 flex-shrink-0" />
          <Separator orientation="vertical" className="h-4" />
          
          {/* Logo - responsive sizing */}
          <div className="hidden sm:block max-w-[200px] overflow-hidden">
            <ThemeLogo 
              width={200} 
              height={60} 
              darkLogoPath="/dark-logo.png" 
              lightLogoPath="/light-logo.png" 
              className="scale-90"
              priority={true}
            />
          </div>
          
          {/* Mobile logo */}
          <div className="sm:hidden max-w-[120px] overflow-hidden">
            <ThemeLogo 
              width={120} 
              height={40} 
              darkLogoPath="/dark-logo.png" 
              lightLogoPath="/light-logo.png" 
              className="scale-75"
              priority={true}
            />
          </div>
          
          {/* Title and breadcrumbs */}
          <div className="hidden md:flex flex-col min-w-0 flex-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {crumb.isCurrentPage ? (
                          <BreadcrumbPage className="line-clamp-1">{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            href={crumb.href} 
                            className="line-clamp-1 hover:text-foreground"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            
            {title && (
              <div className="min-w-0">
                <h1 className="text-lg font-semibold tracking-tight line-clamp-1">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Header actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {actions}
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
})

Header.displayName = "Header"

// Enhanced main layout component
export function MainLayout({
  children,
  breadcrumbs,
  title,
  subtitle,
  actions,
  className,
  showSidebar = true,
}: MainLayoutProps) {
  const { isMobile } = useSidebar()
  const { loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse">
            <ThemeLogo 
              size={48} 
              darkLogoPath="/dark-logo.png" 
              lightLogoPath="/light-logo.png" 
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn("flex min-h-screen bg-background", className)}>
      {showSidebar && <AppSidebar />}
      
      <SidebarInset className={cn("flex flex-col flex-1", !showSidebar && "ml-0")}>
        <Suspense fallback={<HeaderSkeleton />}>
          <Header 
            breadcrumbs={breadcrumbs}
            title={title}
            subtitle={subtitle}
            actions={actions}
          />
        </Suspense>
        
        {/* Main content area with proper spacing and mobile optimization */}
        <main className={cn(
          "flex-1 overflow-hidden",
          "px-3 sm:px-4 lg:px-6 py-4 sm:py-6",
          "space-y-4 sm:space-y-6"
        )}>
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </div>
  )
}

// Export for use in page components
export default MainLayout
