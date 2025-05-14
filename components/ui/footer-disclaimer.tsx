import React from 'react'
import Link from 'next/link'

export function FooterDisclaimer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-sm px-4 py-3">
      <div className="container mx-auto">
        <div className="text-center mb-2">
          PocketLawyer provides general legal information based on Cameroonian law. It does not offer personalized legal advice, cannot represent you in court, and should not replace consultation with a qualified attorney.
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          <details className="inline-block">
            <summary className="cursor-pointer hover:underline">What PocketLawyer can and cannot do</summary>
            <div className="text-left mt-2 bg-white dark:bg-gray-900 p-3 rounded-md shadow-sm max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-700 dark:text-green-500">PocketLawyer CAN:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provide general information about Cameroonian law</li>
                    <li>Explain legal concepts and terminology</li>
                    <li>Point to relevant statutes and legal resources</li>
                    <li>Help understand legal procedures and requirements</li>
                    <li>Generate basic document templates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-red-700 dark:text-red-500">PocketLawyer CANNOT:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Provide personalized legal advice for specific situations</li>
                    <li>Represent users in court or legal proceedings</li>
                    <li>File documents on behalf of users</li>
                    <li>Guarantee outcomes in legal matters</li>
                    <li>Replace professional legal counsel</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 text-center">
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </Link>
                {' | '}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </footer>
  )
}