"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'
import { LoadingContainer } from '@/components/loading-optimization'

// Dynamically import components
const NotFoundContent = dynamic(
  () => import('@/components/ui/not-found-content'),
  {
    loading: () => <LoadingContainer />,
    ssr: false
  }
)

export default function NotFound() {
  return <NotFoundContent />
}