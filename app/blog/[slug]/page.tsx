"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeLogo } from "@/components/theme-logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { ArrowLeft, Calendar, Loader2, Share2, User } from "lucide-react"
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Blog post type definition
type BlogPost = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    image?: string;
  };
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
};

export default function BlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    async function fetchBlogPost() {
      if (!params.slug) return
      
      try {
        setLoading(true)
        
        // Query for the blog post by slug
        const blogQuery = query(
          collection(db, "blog-posts"),
          where("slug", "==", params.slug),
          where("published", "==", true)
        )
        
        const querySnapshot = await getDocs(blogQuery)
        
        if (querySnapshot.empty) {
          setError("Blog post not found")
          return
        }
        
        // There should be only one post with this slug
        const postDoc = querySnapshot.docs[0]
        const postData = postDoc.data() as BlogPost
        
        setPost({
          ...postData,
          id: postDoc.id
        })
        
        // Fetch related posts in the same category (excluding current post)
        if (postData.category) {
          const relatedQuery = query(
            collection(db, "blog-posts"),
            where("category", "==", postData.category),
            where("published", "==", true)
          )
          
          const relatedSnapshot = await getDocs(relatedQuery)
          const relatedData = relatedSnapshot.docs
            .map(doc => ({ ...doc.data(), id: doc.id } as BlogPost))
            .filter(p => p.slug !== params.slug)
            .slice(0, 3) // Limit to 3 related posts
          
          setRelatedPosts(relatedData)
        }
      } catch (err) {
        console.error("Error fetching blog post:", err)
        setError("Failed to load blog post. Please try again later.")
        toast.error("Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }
    
    fetchBlogPost()
  }, [params.slug])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Function to render paragraphs from the content
  const renderContent = (content: string) => {
    const paragraphs = content.split('\n')
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />
      return <p key={index} className="mb-4">{paragraph}</p>
    })
  }
  
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
            {/* Back button */}
            <Button 
              variant="ghost" 
              className="mb-4 gap-1" 
              onClick={() => router.push('/blog')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("Back to Blog")}
            </Button>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">{t("Loading article...")}</p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-6 rounded-lg text-center my-8">
                <h2 className="text-xl font-bold mb-2">{t("Error")}</h2>
                <p className="mb-4">{error}</p>
                <Button 
                  onClick={() => router.push('/blog')} 
                  variant="outline"
                >
                  {t("Return to Blog")}
                </Button>
              </div>
            ) : post ? (
              <>
                {/* Featured category badge */}
                <div className="mb-4">
                  <Badge className="text-sm py-1 px-3">{post.category}</Badge>
                </div>
                
                {/* Title */}
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                
                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-4 mb-8 text-muted-foreground">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.image || ''} alt={post.author.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Featured image */}
                {post.featuredImage && (
                  <div className="mb-8">
                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="prose dark:prose-invert max-w-none mb-12">
                  {renderContent(post.content)}
                </div>
                
                {/* Share button */}
                <div className="border-t border-b py-6 mb-10">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.title,
                          text: post.excerpt,
                          url: window.location.href
                        })
                        .catch(err => {
                          // Only show an error if it's not a user cancellation
                          if (err.name !== 'AbortError') {
                            console.error('Error sharing:', err);
                            toast.error("Failed to share article");
                          }
                          // User cancellation is a normal action, not an error to report
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success("Link copied to clipboard")
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    {t("Share this article")}
                  </Button>
                </div>
                
                {/* Related posts */}
                {relatedPosts.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-6">{t("Related Articles")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedPosts.map(relatedPost => (
                        <Card key={relatedPost.id} className="overflow-hidden">
                          <Link href={`/blog/${relatedPost.slug}`}>
                            <CardHeader className="pb-2">
                              <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                                {relatedPost.title}
                              </CardTitle>
                            </CardHeader>
                            {relatedPost.featuredImage && (
                              <CardContent className="p-0">
                                <div className="aspect-video w-full overflow-hidden">
                                  <img
                                    src={relatedPost.featuredImage}
                                    alt={relatedPost.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </CardContent>
                            )}
                            <CardFooter className="pt-4">
                              <div className="text-sm text-muted-foreground">
                                {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                              </div>
                            </CardFooter>
                          </Link>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p>{t("No blog post found")}</p>
                <Button 
                  onClick={() => router.push('/blog')} 
                  variant="outline"
                  className="mt-4"
                >
                  {t("Return to Blog")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </div>
  )
}