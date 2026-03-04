import React from 'react'
import Link from 'next/link'
import { LegalTermsHighlighter } from "@/components/legal-terminology"
import { useLanguage } from "@/contexts/language-context"

export function FooterDisclaimer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-sm px-4 py-3">
      <div className="container mx-auto">
        <div className="text-center mb-2">
          <LegalTermsHighlighter text={t("footer.disclaimer")} />
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          <details className="inline-block">
            <summary className="cursor-pointer hover:underline">{t("footer.capabilities")}</summary>
            <div className="text-left mt-2 bg-white dark:bg-gray-900 p-3 rounded-md shadow-sm max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-700 dark:text-green-500">{t("footer.can")}</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><LegalTermsHighlighter text={t("footer.can.1")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.can.2")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.can.3")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.can.4")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.can.5")} /></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-red-700 dark:text-red-500">{t("footer.cannot")}</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><LegalTermsHighlighter text={t("footer.cannot.1")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.cannot.2")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.cannot.3")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.cannot.4")} /></li>
                    <li><LegalTermsHighlighter text={t("footer.cannot.5")} /></li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 text-center">
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {t("footer.terms")}
                </Link>
                {' | '}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  {t("footer.privacy")}
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </footer>
  )
}