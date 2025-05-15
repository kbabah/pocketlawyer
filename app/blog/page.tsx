"use client"

import React, { useEffect, useState } from 'react'
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
import { Loader2, SearchIcon } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from "sonner"

// Define a type for blog posts
type BlogPost = {
  id: string;
  title: string;
  description?: string;
  excerpt: string;
  content: string;
  date?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  slug: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  published: boolean;
  readTime?: string;
};

export default function BlogPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch blog posts from Firestore
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        setLoading(true);
        // Query only published blog posts
        const blogQuery = query(
          collection(db, "blog-posts"), 
          where("published", "==", true),
          orderBy("publishedAt", "desc")
        );
        
        const querySnapshot = await getDocs(blogQuery);
        
        if (querySnapshot.empty) {
          setBlogPosts([]);
          setCategories([]);
          return;
        }
        
        const posts = querySnapshot.docs.map(doc => {
          const data = doc.data() as BlogPost;
          return {
            ...data,
            id: doc.id,
            // Calculate read time based on content length (rough estimate)
            readTime: `${Math.max(1, Math.round(data.content.length / 1500))} min read`
          };
        });
        
        setBlogPosts(posts);
        
        // Extract unique categories
        const allCategories = [...new Set(posts.map(post => post.category))];
        setCategories(allCategories);
        
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError("Failed to load blog posts. Please try again later.");
        toast.error("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    }
    
    fetchBlogPosts();
  }, []);
  
  // Filter posts based on search query and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Extract all unique tags for the sidebar
  const allTags = [...new Set(blogPosts.flatMap(post => post.tags))].slice(0, 10);
  
  // Newsletter subscription state
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  // Handle newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubscriptionMessage({
        type: "error",
        text: t("Please enter your email address")
      });
      return;
    }
    
    try {
      setIsSubscribing(true);
      setSubscriptionMessage(null);
      
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptionMessage({
          type: "success",
          text: t(data.message)
        });
        setEmail("");
        toast.success(t(data.message));
      } else {
        setSubscriptionMessage({
          type: "error",
          text: t(data.error)
        });
        toast.error(t(data.error));
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      setSubscriptionMessage({
        type: "error",
        text: t("Failed to process subscription. Please try again.")
      });
      toast.error(t("Failed to process subscription. Please try again."));
    } finally {
      setIsSubscribing(false);
    }
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
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading articles...</span>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
                <p>{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : (
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
                    
                    {allTags.length > 0 && (
                      <div className="border-t mt-4 pt-4">
                        <h3 className="font-medium mb-3">{t("Popular Tags")}</h3>
                        <div className="flex flex-wrap gap-2">
                          {allTags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => setSearchQuery(tag)}
                            >
                              {t(tag)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
                              {post.title}
                            </CardTitle>
                            <CardDescription className="text-base">{post.excerpt}</CardDescription>
                          </CardHeader>
                        </Link>
                        {post.featuredImage && (
                          <div className="px-6">
                            <div className="aspect-video w-full overflow-hidden rounded-md">
                              <img 
                                src={post.featuredImage} 
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <CardFooter className="border-t mt-4 pt-4 flex justify-between">
                          <div className="text-sm text-muted-foreground">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="flex gap-1.5">
                            {post.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
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
                      <Input 
                        placeholder={t("Enter your email")} 
                        className="flex-1" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button 
                        onClick={handleSubscribe}
                        disabled={isSubscribing}
                      >
                        {isSubscribing ? t("Subscribing...") : t("Subscribe")}
                      </Button>
                    </CardContent>
                    {subscriptionMessage && (
                      <div className={`mt-2 text-sm ${subscriptionMessage.type === "success" ? "text-success" : "text-destructive"}`}>
                        {subscriptionMessage.text}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}