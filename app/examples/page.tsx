"use client"

import React from 'react'
import Link from 'next/link'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeLogo } from "@/components/theme-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { Home, Briefcase, FileText, HelpCircle, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react"

export default function ExamplesPage() {
  const { t } = useLanguage()
  
  return (
    <SidebarProvider>
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

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gradient-to-br from-background via-background to-slate-50/30 dark:to-slate-900/30">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">{t("Example Case Studies")}</h1>
              <p className="text-base text-muted-foreground max-w-2xl">
                {t("These anonymized, hypothetical case studies demonstrate how PocketLawyer can help with various legal scenarios in Cameroon. These examples showcase the AI's capabilities but are not personalized legal advice.")}
              </p>
            </div>

            <Tabs defaultValue="property" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger value="property" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md transition-all">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("Property Law")}</span>
                  <span className="sm:hidden">{t("Property")}</span>
                </TabsTrigger>
                <TabsTrigger value="employment" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md transition-all">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("Employment")}</span>
                  <span className="sm:hidden">{t("Work")}</span>
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md transition-all">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("Contracts")}</span>
                  <span className="sm:hidden">{t("Docs")}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="property" className="space-y-4">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-t-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                        <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{t("Residential Tenancy Dispute")}</CardTitle>
                        <CardDescription className="mt-1">{t("A hypothetical example of how PocketLawyer explains tenant rights")}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold text-sm text-blue-900 dark:text-blue-200">{t("User Question")}</p>
                      </div>
                      <p className="text-sm ml-6 text-slate-700 dark:text-slate-300">{t("My landlord in Yaoundé wants to evict me with only 7 days notice after living here for 3 years. Is this legal?")}</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold text-sm text-green-900 dark:text-green-200">{t("PocketLawyer Response")}</p>
                      </div>
                      <div className="ml-6 space-y-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{t("Under Cameroonian law, your landlord cannot legally evict you with only 7 days notice after a 3-year tenancy. Here's what you should know:")}</p>
                        
                        <ol className="list-decimal ml-5 space-y-2">
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("According to Law No. 97/003 of 10 January 1997 on housing policy, a landlord must provide reasonable notice for termination of a long-term residential lease.")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("For tenancies that have lasted more than one year, a minimum notice period of 3 months is typically required in most jurisdictions in Cameroon.")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("The landlord must also have valid grounds for eviction (such as non-payment of rent, property damage, or legitimate need to repossess the property for personal use).")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("A formal written notice must be provided, not just a verbal request to vacate.")}
                          </li>
                        </ol>
                        
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-300 dark:border-slate-700">
                          <p className="font-medium text-xs text-slate-700 dark:text-slate-300 mb-2">{t("Additional Resources")}</p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Ministry of Housing and Urban Development (MINHDU)")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Local housing authority in Yaoundé")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Legal aid services through the Cameroon Bar Association")}</li>
                          </ul>
                        </div>
                        
                        <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900/30">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-900 dark:text-amber-200">
                            {t("Note: While this information reflects general principles of Cameroonian tenancy law, you should consult with a qualified attorney for advice specific to your situation.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employment" className="space-y-4">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-t-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-1">
                        <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{t("Unfair Dismissal Case")}</CardTitle>
                        <CardDescription className="mt-1">{t("A hypothetical example of how PocketLawyer explains employment rights")}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold text-sm text-purple-900 dark:text-purple-200">{t("User Question")}</p>
                      </div>
                      <p className="text-sm ml-6 text-slate-700 dark:text-slate-300">{t("I was dismissed from my job in Douala without any prior warning or explanation after working there for 2 years. Do I have any rights?")}</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold text-sm text-green-900 dark:text-green-200">{t("PocketLawyer Response")}</p>
                      </div>
                      <div className="ml-6 space-y-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{t("Based on Cameroonian labor law, specifically the Labour Code (Law No. 92/007 of 14 August 1992), you have several rights in this situation:")}</p>
                        
                        <ol className="list-decimal ml-5 space-y-2">
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Right to notice: For an employee who has worked for more than 6 months, the employer must provide notice before termination. For 2 years of service, this is typically 1 month.")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Right to reason: Under Section 34 of the Labour Code, an employer must provide valid reasons for dismissal.")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Severance pay: You may be entitled to severance pay based on your length of service (approximately 20% of monthly salary per year of service).")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Right to challenge: You have the right to challenge an unfair dismissal before the labour inspector or labour court within 3 months.")}
                          </li>
                        </ol>
                        
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-300 dark:border-slate-700">
                          <p className="font-medium text-xs text-slate-700 dark:text-slate-300 mb-2">{t("Possible remedies include")}</p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Reinstatement to your position")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Compensation for unfair dismissal")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Payment of outstanding salaries and benefits")}</li>
                          </ul>
                        </div>
                        
                        <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900/30">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-900 dark:text-amber-200">
                            {t("Note: While this information reflects general principles of Cameroonian employment law, time limits apply for filing claims, and you should consult with a qualified labor attorney for advice specific to your situation.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contracts" className="space-y-4">
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 rounded-t-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mt-1">
                        <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{t("Business Contract Dispute")}</CardTitle>
                        <CardDescription className="mt-1">{t("A hypothetical example of how PocketLawyer explains contract law")}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold text-sm text-orange-900 dark:text-orange-200">{t("User Question")}</p>
                      </div>
                      <p className="text-sm ml-6 text-slate-700 dark:text-slate-300">{t("I paid a contractor in Bamenda 70% upfront to renovate my shop, but they abandoned the work after completing only 30%. What are my legal options?")}</p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="font-semibold text-sm text-green-900 dark:text-green-200">{t("PocketLawyer Response")}</p>
                      </div>
                      <div className="ml-6 space-y-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{t("Under Cameroonian contract law, which is primarily based on the OHADA Uniform Act on General Commercial Law and the Civil Code, you have several legal options:")}</p>
                        
                        <ol className="list-decimal ml-5 space-y-2">
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Formal notice: Send a formal notice (mise en demeure) to the contractor, requesting completion of the work within a reasonable timeframe (typically 15-30 days).")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Contract termination: If they fail to respond or complete the work, you can terminate the contract for breach (résiliation du contrat).")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Demand refund: You can demand a partial refund for the portion of work not completed (approximately 40% of the total contract value).")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Civil action: File a civil action for breach of contract at the Court of First Instance in Bamenda.")}
                          </li>
                          <li className="text-sm text-slate-700 dark:text-slate-300">
                            {t("Damages: Seek damages for additional costs incurred to hire another contractor to complete the work.")}
                          </li>
                        </ol>
                        
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded border border-slate-300 dark:border-slate-700">
                          <p className="font-medium text-xs text-slate-700 dark:text-slate-300 mb-2">{t("Documentation needed")}</p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Written contract with the contractor")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Proof of payment")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Photos or evidence of incomplete work")}</li>
                            <li className="text-xs text-slate-600 dark:text-slate-400">{t("Any written communications with the contractor")}</li>
                          </ul>
                        </div>
                        
                        <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900/30">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-900 dark:text-amber-200">
                            {t("Note: While this information reflects general principles of Cameroonian contract law, you should consult with a qualified attorney for advice specific to your situation and for assistance with drafting legal notices.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-6 md:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">{t("More Legal Questions?")}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 max-w-md mx-auto">{t("These examples show just a few of the many legal scenarios PocketLawyer can help with. Chat with our AI assistant to explore other legal topics relevant to you.")}</p>
              <Link 
                href="/" 
                className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("Chat with PocketLawyer AI")}
              </Link>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
    </SidebarProvider>
  )
}