"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PocketLawyer</span>
          </Link>
        </div>
      </header>

      <main className="container py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: April 24, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p>This Privacy Policy describes how PocketLawyer collects, uses, discloses, and protects your information when you use our website and services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
            <p>We may collect the following information:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Personal Information:</strong> Name, email address, and account credentials when you register.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, device information, pages visited, and interactions with our services.</li>
              <li><strong>Chat and Document Data:</strong> Content of legal questions, document uploads, and AI-generated responses.</li>
              <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance functionality and analytics.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. How We Use Information</h2>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>To provide, maintain, and improve our services.</li>
              <li>To personalize your experience and deliver relevant content.</li>
              <li>To communicate updates, security alerts, and support messages.</li>
              <li>To analyze usage patterns and monitor trends.</li>
              <li>To detect, prevent, and address technical issues and fraud.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Sharing of Information</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><strong>Service Providers:</strong> Hosting, analytics, AI engine providers, and other third parties assisting us in service delivery.</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights, privacy, safety, or property.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
            <p>We do not sell personal data to third parties.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Data Security</h2>
            <p>We implement reasonable technical and organizational measures to protect your data from unauthorized access, disclosure, or destruction. However, no internet transmission is perfectly secure.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Data Retention</h2>
            <p>We retain your information as long as necessary to provide services, comply with legal obligations, resolve disputes, and enforce agreements.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Your Rights</h2>
            <p>You have the right to access, correct, delete, or restrict processing of your personal data. To exercise these rights, please contact us at our contact page.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Cookies</h2>
            <p>We use cookies for essential site functionality and analytics. You can control cookie settings through your browser preferences.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Children’s Privacy</h2>
            <p>Our service is not directed to children under 13. We do not knowingly collect personal data from children without parental consent.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy. We will notify you of material changes by posting the new policy on this page with an updated date.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Contact Information</h2>
            <p>If you have questions about this Privacy Policy, please reach out on our <Link href="/contact" className="text-primary underline">Contact Page</Link>.</p>
          </section>

          <div className="pt-8">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}