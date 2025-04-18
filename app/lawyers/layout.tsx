import type { Metadata } from 'next'
import { LawyersLayoutClient } from "@/components/lawyers-layout-client"

export const metadata: Metadata = {
  title: "Find a Lawyer | Pocket Lawyer",
  description: "Connect with qualified legal professionals for consultations and advice.",
}

export default function LawyersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LawyersLayoutClient>{children}</LawyersLayoutClient>
}