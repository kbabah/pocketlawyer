"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale } from "lucide-react"
import { LegalTermsHighlighter } from "@/components/legal-terminology"
import { useLanguage } from "@/contexts/language-context"

export default function TermsPage() {
  const { t } = useLanguage();
  
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
              <li>
                <LegalTermsHighlighter
                  text={t("PocketLawyer provides information and guidance strictly related to the laws and legal procedures of Cameroon.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("The service helps users understand Cameroonian legal concepts, processes, and requirements, and does not cover laws outside Cameroon.")}
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. No Legal Advice or Representation</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>
                <LegalTermsHighlighter
                  text={t("The information provided by PocketLawyer is for general informational purposes only.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("PocketLawyer does not offer legal advice, opinions, or representation, and does not create a lawyer-client relationship.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("For specific legal advice or representation, consult a qualified lawyer licensed in Cameroon.")}
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Responsibilities</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>
                <LegalTermsHighlighter
                  text={t("You are responsible for how you use the information provided by PocketLawyer.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("Verify any information before relying on it for legal decisions or actions.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("Do not use PocketLawyer for unlawful purposes or seek advice on non‑Cameroonian legal matters.")}
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Limitations and Disclaimers</h2>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>
                <LegalTermsHighlighter
                  text={t("PocketLawyer strives for accuracy but cannot guarantee completeness or timeliness of all content.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("We are not liable for any loss or damage resulting from reliance on the information provided.")}
                />
              </li>
              <li>
                <LegalTermsHighlighter
                  text={t("The service may refer you to consult a qualified legal professional when appropriate.")}
                />
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Privacy and Data Use</h2>
            <p>
              <LegalTermsHighlighter
                text={t("PocketLawyer may collect and use information you provide to improve the service and respond to your queries. Your data will be handled per applicable Cameroonian data protection laws.")}
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
            <p>
              <LegalTermsHighlighter
                text={t("PocketLawyer may update or modify these terms at any time. Continued use after changes means you accept the updated terms.")}
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
            <p>
              <LegalTermsHighlighter
                text={t("All content and materials provided by PocketLawyer are the property of PocketLawyer or its licensors. You may not copy or distribute content without permission.")}
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Governing Law</h2>
            <p>
              <LegalTermsHighlighter
                text={t("These terms and conditions are governed by the laws of Cameroon.")}
              />
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Contact and Complaints</h2>
            <p>
              <LegalTermsHighlighter
                text={t("If you have questions or complaints about PocketLawyer, contact us via our ")}
              />
              <Link href="/contact" className="text-primary underline">Contact Page</Link>.
            </p>
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