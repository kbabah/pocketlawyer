"use client"

import { useEffect, useState } from "react"
import { MOBILE_BREAKPOINT } from "@/lib/breakpoints"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    const mql = window.matchMedia(query)

    const onChange = () => {
      setIsMobile(mql.matches)
    }

    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
