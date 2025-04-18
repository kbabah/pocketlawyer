import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register as a Lawyer | Pocket Lawyer',
  description: 'Join our platform as a legal professional to offer consultation services to clients.',
}

export default function LawyerRegistrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}