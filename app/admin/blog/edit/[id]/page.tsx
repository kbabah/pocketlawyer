"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Eye, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";

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
  tags: z.string().transform(val => 
    typeof val === 'string' 
      ? val.split(",").map(tag => tag.trim()).filter(tag => tag !== "") 
      : val
  ),
  published: z.boolean().default(false),
});

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Fetch blog post data
  useEffect(() => {
    async function fetchBlogPost() {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/blog/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }
        
        const post = await response.json();
        
        form.reset({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: post.featuredImage || "",
          category: post.category,
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags,
          published: post.published,
        });
      } catch (error) {
        console.error("Failed to fetch blog post:", error);
        toast.error("Failed to load blog post data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBlogPost();
  }, [params.id, form]);

  async function onSubmit(values: z.infer<typeof blogPostSchema>) {
    if (!user) {
      toast.error("You must be logged in to update blog posts");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const blogPostData = {
        ...values,
        id: params.id,
      };
      
      // Send to API
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogPostData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update blog post");
      }
      
      toast.success("Blog post updated successfully");
    } catch (error) {
      console.error("Failed to update blog post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update blog post");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!params.id) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }
      
      toast.success("Blog post deleted successfully");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Failed to delete blog post");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading blog post data...</p>
        </div>
      </div>
    );
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
            <p className="text-muted-foreground">
              Update your blog post content and settings
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
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSubmitting || isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
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
                {typeof form.watch("tags") === "string" && form.watch("tags").split(",").map((tag, i) => (
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
                            value={field.value}
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
                              Published
                            </FormLabel>
                            <FormDescription>
                              If checked, the post will be visible to users.
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
                        "Save Changes"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </form>
      </Form>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The blog post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}