'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, render children without theme context to match SSR
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
