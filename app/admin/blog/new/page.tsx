"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Eye } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";

// Rich Text Editor (using a simple textarea for now, but you can integrate a more advanced editor)
// You might want to add a real rich text editor library like TipTap, Lexical, or Draft.js

// Define schema for blog post form
const blogPostSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  slug: z.string().min(3, {
    message: "Slug must be at least 3 characters.",
  }).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must contain only lowercase letters, numbers, and hyphens.",
  }),
  excerpt: z.string().min(10, {
    message: "Excerpt must be at least 10 characters.",
  }).max(300, {
    message: "Excerpt cannot exceed 300 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  featuredImage: z.string().url({
    message: "Featured image must be a valid URL.",
  }).optional().or(z.literal("")),
  category: z.string({
    required_error: "Please select a category.",
  }),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim()).filter(tag => tag !== "")),
  published: z.boolean().default(false),
});

export default function NewBlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      category: "",
      tags: "",
      published: false,
    },
  });

  // Auto-generate slug from title
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    form.setValue("title", value);
    
    // Only auto-generate slug if it hasn't been manually edited or is empty
    if (!form.getValues("slug")) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-")     // Replace spaces with hyphens
        .replace(/-+/g, "-");     // Replace multiple hyphens with single hyphen
      
      form.setValue("slug", slug);
    }
  };

  async function onSubmit(values: z.infer<typeof blogPostSchema>) {
    if (!user) {
      toast.error("You must be logged in to create blog posts");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const blogPostData = {
        ...values,
        author: {
          id: user.id,
          name: user.name || "Admin",
          image: user.profileImage || "",
        },
        publishedAt: values.published ? new Date().toISOString() : null,
      };
      
      // Send to API
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogPostData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create blog post");
      }
      
      toast.success("Blog post created successfully");
      
      // Navigate to blog management
      router.push("/admin/blog");
    } catch (error) {
      console.error("Failed to create blog post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>
            <p className="text-muted-foreground">
              Create a new blog post for your website
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            disabled={isSubmitting}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Publish Post
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {previewMode ? (
            <Card className="overflow-hidden">
              <div className="aspect-video w-full bg-muted relative flex items-center justify-center border-b">
                {form.watch("featuredImage") ? (
                  <img 
                    src={form.watch("featuredImage")} 
                    alt="Featured" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-12">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No featured image</p>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                    {form.watch("category") || "Uncategorized"}
                  </div>
                  {form.watch("published") && (
                    <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs">
                      Published
                    </div>
                  )}
                </div>
                <CardTitle className="text-3xl">{form.watch("title") || "Untitled Post"}</CardTitle>
                <CardDescription className="text-base">{form.watch("excerpt") || "No excerpt provided."}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {/* This would ideally be rendered markdown/HTML but for simplicity we're using plain text */}
                  {form.watch("content").split("\n").map((paragraph, i) => (
                    paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t flex flex-wrap gap-1 py-4">
                {form.watch("tags").split(",").map((tag, i) => (
                  tag.trim() !== "" && (
                    <div key={i} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                      {tag.trim()}
                    </div>
                  )
                ))}
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content</CardTitle>
                    <CardDescription>
                      Write your blog post content here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter post title" 
                              {...field}
                              onChange={handleTitleChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief summary of your post (shown in previews)" 
                              className="resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Keep it concise, ideally under 160 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your blog post content here..." 
                              className="min-h-[400px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can format your content with Markdown.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      Configure your blog post settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="post-url-slug" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The URL-friendly version of the title.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="property">Property</SelectItem>
                              <SelectItem value="rights">Rights</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="family">Family Law</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="law, property, rights" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated tags to categorize your post.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Direct link to the featured image for this post.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Publish immediately
                            </FormLabel>
                            <FormDescription>
                              If unchecked, the post will be saved as a draft.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="border-t flex justify-between p-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/blog")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Post"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}