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
            <h1 className="text-3xl font-bold mb-4">Privacy Policy for PocketLawyer</h1>
            <p className="text-muted-foreground">Last Updated: April 26, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>PocketLawyer is committed to protecting your personal data in accordance with Cameroonian law.</li>
              <li>This policy explains how we collect, use, store, and protect your information.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Personal Information you provide, such as your name, email address, and legal questions.</li>
              <li>Technical data, such as your IP address and device information, for security and analytics.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Use of Your Information</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>To provide legal information and improve our services.</li>
              <li>We do not use your data for marketing without your consent.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Data Sharing and Disclosure</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>We do not share personal data with third parties except as required by Cameroonian law or with your consent.</li>
              <li>We may disclose information to comply with legal obligations or protect our rights.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data from unauthorized access, loss, or misuse, as required by Law No. 2010/012 of 21 December 2010 on Cybersecurity and Cybercrime.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Data Retention</h2>
            <p>We retain your personal data only as long as necessary to fulfill the purposes stated in this policy or as required by law.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Your Rights</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>You have the right to access, correct, or request deletion of your personal data.</li>
              <li>You may withdraw consent to data processing at any time, subject to legal or contractual restrictions.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Cookies and Tracking</h2>
            <p>We may use cookies to enhance your experience. You can manage cookie preferences in your browser settings.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Changes to This Policy</h2>
            <p>We may update this policy to comply with changes in Cameroonian law or our practices. We will notify you of significant changes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p>If you have questions or wish to exercise your rights, contact us at: [Insert contact details]</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Legal References</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Law No. 2010/012 of 21 December 2010 on Cybersecurity and Cybercrime (Articles 42–48)</li>
              <li>Law No. 2010/021 of 21 December 2010 on Electronic Commerce</li>
            </ul>
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