import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Find a Lawyer | Pocket Lawyer",
  description: "Connect with qualified legal professionals for consultations and advice.",
}

export default function LawyersRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}