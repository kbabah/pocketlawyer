"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale } from "lucide-react"

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold mb-4">PocketLawyer User Terms and Conditions</h1>
            <p className="text-muted-foreground">Last Updated: April 26, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Scope of Service</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>PocketLawyer provides information and guidance strictly related to the laws and legal procedures of Cameroon.</li>
              <li>The service helps users understand Cameroonian legal concepts, processes, and requirements, and does not cover laws outside Cameroon.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. No Legal Advice or Representation</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>The information provided by PocketLawyer is for general informational purposes only.</li>
              <li>PocketLawyer does not offer legal advice, opinions, or representation, and does not create a lawyer-client relationship.</li>
              <li>For specific legal advice or representation, consult a qualified lawyer licensed in Cameroon.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>You are responsible for how you use the information provided by PocketLawyer.</li>
              <li>Verify any information before relying on it for legal decisions or actions.</li>
              <li>Do not use PocketLawyer for unlawful purposes or seek advice on non‑Cameroonian legal matters.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Limitations and Disclaimers</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>PocketLawyer strives for accuracy but cannot guarantee completeness or timeliness of all content.</li>
              <li>We are not liable for any loss or damage resulting from reliance on the information provided.</li>
              <li>The service may refer you to consult a qualified legal professional when appropriate.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Privacy and Data Use</h2>
            <p>PocketLawyer may collect and use information you provide to improve the service and respond to your queries. Your data will be handled per applicable Cameroonian data protection laws.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
            <p>PocketLawyer may update or modify these terms at any time. Continued use after changes means you accept the updated terms.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            <p>All content and materials provided by PocketLawyer are the property of PocketLawyer or its licensors. You may not copy or distribute content without permission.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Governing Law</h2>
            <p>These terms and conditions are governed by the laws of Cameroon.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Contact and Complaints</h2>
            <p>If you have questions or complaints about PocketLawyer, contact us via our <Link href="/contact" className="text-primary underline">Contact Page</Link>.</p>
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