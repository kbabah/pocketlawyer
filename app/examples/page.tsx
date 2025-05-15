"use client"

import React from 'react'
import Link from 'next/link'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeLogo } from "@/components/theme-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"

export default function ExamplesPage() {
  const { t } = useLanguage()
  
  return (
    <div className="flex min-h-[100dvh] bg-pattern-light dark:bg-pattern-dark">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <SidebarTrigger className="-ml-1 flex-shrink-0" />
            <div className="max-w-[70%] overflow-hidden">
              <ThemeLogo 
                width={250} 
                height={100} 
                darkLogoPath="/dark-logo.png" 
                lightLogoPath="/light-logo.png" 
                className="flex-shrink-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
            <Link href="/" className="text-sm font-medium hover:underline">
              {t("Return to Chat")}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">{t("Example Case Studies")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("These anonymized, hypothetical case studies demonstrate how PocketLawyer can help with various legal scenarios in Cameroon. These examples showcase the AI's capabilities but are not personalized legal advice.")}
            </p>

            <Tabs defaultValue="property" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="property">{t("Property Law")}</TabsTrigger>
                <TabsTrigger value="employment">{t("Employment")}</TabsTrigger>
                <TabsTrigger value="contracts">{t("Contracts")}</TabsTrigger>
              </TabsList>

              <TabsContent value="property">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Residential Tenancy Dispute")}</CardTitle>
                    <CardDescription>{t("A hypothetical example of how PocketLawyer explains tenant rights")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                        <p className="font-medium">{t("User Question:")}</p>
                        <p className="mt-2">{t("My landlord in Yaoundé wants to evict me with only 7 days notice after living here for 3 years. Is this legal?")}</p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border-l-4 border-primary">
                        <p className="font-medium">{t("PocketLawyer Response:")}</p>
                        <div className="mt-2 space-y-2">
                          <p>{t("Under Cameroonian law, your landlord cannot legally evict you with only 7 days notice after a 3-year tenancy. Here's what you should know:")}</p>
                          
                          <ol className="list-decimal ml-5 space-y-1">
                            <li>
                              {t("According to Law No. 97/003 of 10 January 1997 on housing policy, a landlord must provide reasonable notice for termination of a long-term residential lease.")}
                            </li>
                            <li>
                              {t("For tenancies that have lasted more than one year, a minimum notice period of 3 months is typically required in most jurisdictions in Cameroon.")}
                            </li>
                            <li>
                              {t("The landlord must also have valid grounds for eviction (such as non-payment of rent, property damage, or legitimate need to repossess the property for personal use).")}
                            </li>
                            <li>
                              {t("A formal written notice must be provided, not just a verbal request to vacate.")}
                            </li>
                          </ol>
                          
                          <p>{t("Additional Resources:")}</p>
                          <ul className="list-disc ml-5">
                            <li>{t("Ministry of Housing and Urban Development (MINHDU)")}</li>
                            <li>{t("Local housing authority in Yaoundé")}</li>
                            <li>{t("Legal aid services through the Cameroon Bar Association")}</li>
                          </ul>
                          
                          <p className="text-sm text-muted-foreground mt-4">
                            {t("Note: While this information reflects general principles of Cameroonian tenancy law, you should consult with a qualified attorney for advice specific to your situation.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employment">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Unfair Dismissal Case")}</CardTitle>
                    <CardDescription>{t("A hypothetical example of how PocketLawyer explains employment rights")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                        <p className="font-medium">{t("User Question:")}</p>
                        <p className="mt-2">{t("I was dismissed from my job in Douala without any prior warning or explanation after working there for 2 years. Do I have any rights?")}</p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border-l-4 border-primary">
                        <p className="font-medium">{t("PocketLawyer Response:")}</p>
                        <div className="mt-2 space-y-2">
                          <p>{t("Based on Cameroonian labor law, specifically the Labour Code (Law No. 92/007 of 14 August 1992), you have several rights in this situation:")}</p>
                          
                          <ol className="list-decimal ml-5 space-y-1">
                            <li>
                              {t("Right to notice: For an employee who has worked for more than 6 months, the employer must provide notice before termination. For 2 years of service, this is typically 1 month.")}
                            </li>
                            <li>
                              {t("Right to reason: Under Section 34 of the Labour Code, an employer must provide valid reasons for dismissal.")}
                            </li>
                            <li>
                              {t("Severance pay: You may be entitled to severance pay based on your length of service (approximately 20% of monthly salary per year of service).")}
                            </li>
                            <li>
                              {t("Right to challenge: You have the right to challenge an unfair dismissal before the labour inspector or labour court within 3 months.")}
                            </li>
                          </ol>
                          
                          <p>{t("Possible remedies include:")}</p>
                          <ul className="list-disc ml-5">
                            <li>{t("Reinstatement to your position")}</li>
                            <li>{t("Compensation for unfair dismissal")}</li>
                            <li>{t("Payment of outstanding salaries and benefits")}</li>
                          </ul>
                          
                          <p className="text-sm text-muted-foreground mt-4">
                            {t("Note: While this information reflects general principles of Cameroonian employment law, time limits apply for filing claims, and you should consult with a qualified labor attorney for advice specific to your situation.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contracts">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Business Contract Dispute")}</CardTitle>
                    <CardDescription>{t("A hypothetical example of how PocketLawyer explains contract law")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                        <p className="font-medium">{t("User Question:")}</p>
                        <p className="mt-2">{t("I paid a contractor in Bamenda 70% upfront to renovate my shop, but they abandoned the work after completing only 30%. What are my legal options?")}</p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border-l-4 border-primary">
                        <p className="font-medium">{t("PocketLawyer Response:")}</p>
                        <div className="mt-2 space-y-2">
                          <p>{t("Under Cameroonian contract law, which is primarily based on the OHADA Uniform Act on General Commercial Law and the Civil Code, you have several legal options:")}</p>
                          
                          <ol className="list-decimal ml-5 space-y-1">
                            <li>
                              {t("Formal notice: Send a formal notice (mise en demeure) to the contractor, requesting completion of the work within a reasonable timeframe (typically 15-30 days).")}
                            </li>
                            <li>
                              {t("Contract termination: If they fail to respond or complete the work, you can terminate the contract for breach (résiliation du contrat).")}
                            </li>
                            <li>
                              {t("Demand refund: You can demand a partial refund for the portion of work not completed (approximately 40% of the total contract value).")}
                            </li>
                            <li>
                              {t("Civil action: File a civil action for breach of contract at the Court of First Instance in Bamenda.")}
                            </li>
                            <li>
                              {t("Damages: Seek damages for additional costs incurred to hire another contractor to complete the work.")}
                            </li>
                          </ol>
                          
                          <p>{t("Documentation needed:")}</p>
                          <ul className="list-disc ml-5">
                            <li>{t("Written contract with the contractor")}</li>
                            <li>{t("Proof of payment")}</li>
                            <li>{t("Photos or evidence of incomplete work")}</li>
                            <li>{t("Any written communications with the contractor")}</li>
                          </ul>
                          
                          <p className="text-sm text-muted-foreground mt-4">
                            {t("Note: While this information reflects general principles of Cameroonian contract law, you should consult with a qualified attorney for advice specific to your situation and for assistance with drafting legal notices.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-10 text-center">
              <p className="text-muted-foreground mb-4">{t("Need information on other legal topics? Try PocketLawyer's AI assistant.")}</p>
              <Link 
                href="/" 
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {t("Chat with PocketLawyer AI")}
              </Link>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}