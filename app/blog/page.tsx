"use client"

import React from 'react'
import Link from 'next/link'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeLogo } from "@/components/theme-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Sample blog posts data - in a production environment, this would come from a CMS or API
const blogPosts = [
  {
    id: "land-ownership",
    title: "Guide to Land Ownership in Cameroon",
    description: "Understanding the complex land tenure system in Cameroon and how to secure your property rights.",
    date: "2025-05-02",
    category: "Property Law",
    tags: ["land rights", "property", "registration"],
    slug: "land-ownership-cameroon",
    readTime: "8 min read"
  },
  {
    id: "business-registration",
    title: "How to Register a Business in Cameroon",
    description: "Step-by-step guide to legally registering your business entity in accordance with OHADA regulations.",
    date: "2025-04-18",
    category: "Business Law",
    tags: ["business", "registration", "OHADA"],
    slug: "business-registration-cameroon",
    readTime: "10 min read"
  },
  {
    id: "employment-rights",
    title: "Employee Rights Under Cameroonian Labor Code",
    description: "A comprehensive overview of employee protections, benefits, and obligations under the Labor Code.",
    date: "2025-03-25",
    category: "Labor Law",
    tags: ["employment", "workers", "benefits"],
    slug: "employee-rights-cameroon",
    readTime: "12 min read"
  },
  {
    id: "divorce-procedures",
    title: "Divorce Procedures in Cameroon's Legal System",
    description: "Understanding the process, requirements, and legal implications of divorce proceedings in Cameroon.",
    date: "2025-03-10",
    category: "Family Law",
    tags: ["divorce", "family", "marriage"],
    slug: "divorce-procedures-cameroon",
    readTime: "9 min read"
  },
  {
    id: "inheritance-law",
    title: "Inheritance Law: Traditional vs. Modern Legal Systems in Cameroon",
    description: "Navigating the dual legal system when dealing with inheritance and succession matters.",
    date: "2025-02-15",
    category: "Inheritance Law",
    tags: ["inheritance", "succession", "wills"],
    slug: "inheritance-law-cameroon",
    readTime: "11 min read"
  }
];

export default function BlogPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  
  const categories = [...new Set(blogPosts.map(post => post.category))];
  
  // Filter posts based on search query and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
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
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">{t("Legal Resources & Guides")}</h1>
                <p className="text-muted-foreground mt-2">
                  {t("Articles, guides and resources on Cameroonian law to help you understand your rights and obligations.")}
                </p>
              </div>
              
              <div className="flex gap-2">
                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t("Search articles...")} 
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Link href="/examples">
                  <Button variant="outline">{t("View Examples")}</Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar with categories */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border p-4 sticky top-20">
                  <h3 className="font-medium mb-3">{t("Categories")}</h3>
                  <div className="space-y-2">
                    <button 
                      className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${selectedCategory === '' ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedCategory('')}
                    >
                      {t("All Categories")}
                    </button>
                    
                    {categories.map(category => (
                      <button 
                        key={category} 
                        className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${selectedCategory === category ? 'bg-accent' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {t(category)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="border-t mt-4 pt-4">
                    <h3 className="font-medium mb-3">{t("Popular Tags")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {["property", "business", "family", "employment", "inheritance", "contracts", "OHADA"].map(tag => (
                        <Badge key={tag} variant="secondary">{t(tag)}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t mt-4 pt-4">
                    <h3 className="font-medium mb-2">{t("Have a Legal Question?")}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t("Use our AI assistant to get instant answers to your Cameroonian legal questions.")}</p>
                    <Link href="/">
                      <Button className="w-full">{t("Chat with PocketLawyer")}</Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Main content - article cards */}
              <div className="lg:col-span-3 space-y-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <Card key={post.id} className="overflow-hidden">
                      <Link href={`/blog/${post.slug}`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <Badge>{t(post.category)}</Badge>
                            <span className="text-sm text-muted-foreground">{post.readTime}</span>
                          </div>
                          <CardTitle className="text-xl md:text-2xl hover:text-primary transition-colors">
                            {t(post.title)}
                          </CardTitle>
                          <CardDescription className="text-base">{t(post.description)}</CardDescription>
                        </CardHeader>
                      </Link>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <div className="text-sm text-muted-foreground">
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex gap-1.5">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline">{t(tag)}</Badge>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="bg-card rounded-lg border p-8 text-center">
                    <h3 className="text-lg font-medium mb-2">{t("No articles found")}</h3>
                    <p className="text-muted-foreground mb-4">{t("Try adjusting your search or category filters")}</p>
                    <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}>
                      {t("Reset Filters")}
                    </Button>
                  </div>
                )}
                
                {/* Newsletter signup */}
                <Card className="mt-10 bg-primary/5">
                  <CardHeader>
                    <CardTitle>{t("Subscribe to Our Legal Updates")}</CardTitle>
                    <CardDescription>{t("Get the latest articles and resources on Cameroonian law delivered to your inbox")}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder={t("Enter your email")} className="flex-1" />
                    <Button>{t("Subscribe")}</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}