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
            <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
            <p className="text-muted-foreground">Last Updated: April 24, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>By accessing or using PocketLawyer, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Services Description</h2>
            <p>PocketLawyer provides an AI-powered legal assistant for answering legal questions, analyzing documents, and offering general guidance. We may update, modify, or discontinue features at any time without notice.</p>
            <p>You acknowledge that the information provided by our AI is for informational purposes only and is not a substitute for professional legal advice.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p>You must register for an account to access certain features. You agree to provide accurate information and maintain the security of your credentials. You are responsible for all activity under your account and must notify us of any unauthorized use.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. User Conduct</h2>
            <p>Users agree not to:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Violate any applicable laws or regulations.</li>
              <li>Transmit harmful or offensive content.</li>
              <li>Attempt to disrupt or interfere with the service.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
            <p>All content, trademarks, and data on PocketLawyer, including text, graphics, logos, and software, are owned by us or our licensors and protected by applicable intellectual property laws.</p>
            <p>You are granted a limited, non-exclusive license to use the service for personal or internal business purposes only.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Disclaimer of Warranties</h2>
            <p>The service is provided "as is" and "as available" without warranties of any kind. We do not guarantee accuracy, reliability, or suitability of information.</p>
            <p>Your use of PocketLawyer is at your own risk.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <p>In no event shall PocketLawyer or its affiliates be liable for any indirect, incidental, special, or consequential damages arising out of your use of or inability to use the service.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of Cameroon, without regard to conflict of law principles.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Updated terms will be effective upon posting. Continued use of the service constitutes acceptance of the revised terms.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p>For questions about these Terms, please contact us at <Link href="/contact" className="text-primary underline">Contact Page</Link>.</p>
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