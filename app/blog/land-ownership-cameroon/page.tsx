"use client"

import React from 'react'
import Link from 'next/link'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeLogo } from "@/components/theme-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { ChevronLeft, Calendar, Clock, Tag } from "lucide-react"

export default function BlogPostPage() {
  const { t } = useLanguage();
  
  // In a production environment, this data would be fetched from a CMS or API
  const post = {
    title: "Guide to Land Ownership in Cameroon",
    description: "Understanding the complex land tenure system in Cameroon and how to secure your property rights.",
    date: "May 2, 2025",
    author: "Legal Team",
    category: "Property Law",
    tags: ["land rights", "property", "registration"],
    readTime: "8 min read"
  };
  
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

        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-6">
              <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("Back to all articles")}
              </Link>
            </div>
            
            <article>
              <Badge className="mb-4">{t(post.category)}</Badge>
              
              <h1 className="text-4xl font-bold mb-4">{t(post.title)}</h1>
              
              <p className="text-xl text-muted-foreground mb-6">{t(post.description)}</p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 border-b pb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  <span>{post.tags.join(", ")}</span>
                </div>
              </div>

              {/* Article content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2>{t("Overview of Land Tenure in Cameroon")}</h2>
                <p>
                  {t("Cameroon's land tenure system is characterized by legal pluralism, with both statutory law and customary law governing land ownership. This dual system can create confusion and conflict over land rights, especially in rural areas where traditional practices remain strong.")}
                </p>

                <p>
                  {t("The primary legislation governing land ownership in Cameroon includes:")}
                </p>

                <ul>
                  <li>{t("Ordinance No. 74-1 of 6 July 1974")}</li>
                  <li>{t("Ordinance No. 74-2 of 6 July 1974")}</li>
                  <li>{t("Decree No. 76-165 of 27 April 1976")}</li>
                </ul>

                <h2>{t("Types of Land Classification")}</h2>
                <p>
                  {t("Under Cameroonian law, land is classified into three main categories:")}
                </p>

                <h3>{t("1. Public State Land")}</h3>
                <p>
                  {t("This category includes land that cannot be privately owned, such as waterways, public roads, national parks, and other areas designated for public use. This land is managed by the state on behalf of the public.")}
                </p>

                <h3>{t("2. Private State Land")}</h3>
                <p>
                  {t("This includes land owned by the state but which can be allocated to private individuals or entities through concessions, leases, or sales.")}
                </p>

                <h3>{t("3. National Land")}</h3>
                <p>
                  {t("This is land that has not been registered as either public or private state land. It includes land occupied or used under customary law. Most land in rural areas falls under this category.")}
                </p>

                <h2>{t("Land Registration Process")}</h2>
                <p>
                  {t("Securing formal land title in Cameroon involves several steps:")}
                </p>

                <ol>
                  <li>
                    <strong>{t("Initial Application")}</strong>: {t("File an application with the relevant divisional office where the land is located.")}
                  </li>
                  <li>
                    <strong>{t("Land Survey")}</strong>: {t("A government surveyor will inspect and map the land.")}
                  </li>
                  <li>
                    <strong>{t("Public Notice")}</strong>: {t("Publication of the application in official channels for 30 days to allow for any objections.")}
                  </li>
                  <li>
                    <strong>{t("Land Advisory Commission")}</strong>: {t("Review of the application by a commission that includes government officials and traditional authorities.")}
                  </li>
                  <li>
                    <strong>{t("Certificate Issuance")}</strong>: {t("If approved, a land certificate is issued.")}
                  </li>
                </ol>

                <h2>{t("Challenges in Land Ownership")}</h2>
                <p>
                  {t("Several challenges affect land ownership in Cameroon:")}
                </p>

                <ul>
                  <li>{t("Lengthy and costly registration process")}</li>
                  <li>{t("Conflicts between statutory and customary rights")}</li>
                  <li>{t("Limited access to information about land rights")}</li>
                  <li>{t("Corruption and administrative inefficiencies")}</li>
                  <li>{t("Gender inequalities in land access")}</li>
                </ul>

                <h2>{t("Legal Protections for Land Rights")}</h2>
                <p>
                  {t("Despite these challenges, there are legal protections for landowners:")}
                </p>

                <ol>
                  <li>{t("Land certificates provide indefeasible title recognized by law")}</li>
                  <li>{t("Courts can adjudicate land disputes")}</li>
                  <li>{t("Compensations are required for public expropriations")}</li>
                  <li>{t("Inheritance rights are protected, though often subject to customary practices")}</li>
                </ol>

                <h2>{t("Conclusion")}</h2>
                <p>
                  {t("Understanding Cameroon's land tenure system is crucial for securing property rights. While the process of obtaining formal land title can be complex and time-consuming, it provides important legal protections against disputes and uncertainties. For those navigating land ownership issues, seeking professional legal advice is strongly recommended.")}
                </p>
              </div>

              <div className="border-t mt-10 pt-6">
                <h3 className="text-lg font-medium mb-4">{t("Related Topics")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/blog/business-registration-cameroon" className="p-4 border rounded-lg hover:bg-accent">
                    <h4 className="font-medium">{t("How to Register a Business in Cameroon")}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{t("Step-by-step guide to legally registering your business entity")}</p>
                  </Link>
                  <Link href="/blog/inheritance-law-cameroon" className="p-4 border rounded-lg hover:bg-accent">
                    <h4 className="font-medium">{t("Inheritance Law: Traditional vs. Modern Legal Systems")}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{t("Navigating the dual legal system when dealing with inheritance")}</p>
                  </Link>
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-lg mt-10">
                <h3 className="text-lg font-medium mb-2">{t("Have specific questions about land rights?")}</h3>
                <p className="mb-4">{t("Our AI assistant can provide more information about your land ownership concerns.")}</p>
                <Link href="/">
                  <Button>{t("Ask PocketLawyer")}</Button>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}