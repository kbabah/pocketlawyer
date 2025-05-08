"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define form schema with zod
const templateSchema = z.object({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  type: z.string({
    required_error: "Please select a template type.",
  }),
  subject: z.string().min(1, {
    message: "Subject is required.",
  }),
  htmlContent: z.string().min(1, {
    message: "HTML content is required.",
  }),
  plainContent: z.string().optional(),
});

export default function NewTemplatePage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      subject: "",
      htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Title</h1>
    </div>
    
    <div class="content">
      <p>Hello {{name}},</p>
      <p>This is a sample email template. You can customize it to fit your needs.</p>
      
      <p>Key features of our service:</p>
      <ul>
        <li>Feature 1</li>
        <li>Feature 2</li>
        <li>Feature 3</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{actionUrl}}" class="button">Call to Action</a>
      </div>
    </div>
    
    <div class="footer">
      <p>PocketLawyer - Legal guidance at your fingertips</p>
      <p>
        <a href="{{preferencesUrl}}" style="color: #007bff; text-decoration: none;">Email Preferences</a> |
        <a href="{{termsUrl}}" style="color: #007bff; text-decoration: none;">Terms of Service</a> |
        <a href="{{privacyUrl}}" style="color: #007bff; text-decoration: none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`,
      plainContent: "Hello {{name}},\n\nThis is a sample email template. You can customize it to fit your needs.\n\nKey features of our service:\n- Feature 1\n- Feature 2\n- Feature 3\n\nVisit: {{actionUrl}}\n\n--\nPocketLawyer - Legal guidance at your fingertips\nEmail Preferences: {{preferencesUrl}}\nTerms: {{termsUrl}}\nPrivacy: {{privacyUrl}}",
    },
  });

  async function onSubmit(values: z.infer<typeof templateSchema>) {
    try {
      setIsSubmitting(true);
      
      const response = await fetch("/api/admin/email/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create template");
      }
      
      toast.success("Template created successfully");
      router.push("/admin/email");
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  }

  const htmlContent = form.watch("htmlContent");
  
  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Email Template</h1>
          <p className="text-muted-foreground">
            Design and save a new email template for campaigns and notifications.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Template details */}
            <div className="space-y-6 md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Template Details</CardTitle>
                  <CardDescription>
                    Basic information about your email template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Welcome Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe this template's purpose"
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="welcome">Welcome</SelectItem>
                            <SelectItem value="reset-password">Password Reset</SelectItem>
                            <SelectItem value="verification">Verification</SelectItem>
                            <SelectItem value="chat-summary">Chat Summary</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="system-update">System Update</SelectItem>
                            <SelectItem value="legal-alert">Legal Alert</SelectItem>
                            <SelectItem value="receipt">Receipt/Invoice</SelectItem>
                            <SelectItem value="trial-reminder">Trial Reminder</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Used to categorize templates for various purposes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Welcome to PocketLawyer" {...field} />
                        </FormControl>
                        <FormDescription>
                          Supports variables like {'{'}{'{'}}name{'}'}{'}'} 
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Plain Text Version</CardTitle>
                  <CardDescription>
                    Alternative text version for email clients that don't support HTML
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="plainContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Plain text version of your email"
                            className="min-h-[200px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Template editor and preview */}
            <div className="md:col-span-2">
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>Template Editor</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button 
                        type="button" 
                        variant={previewMode === "desktop" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPreviewMode("desktop")}
                        className="h-8"
                      >
                        Desktop
                      </Button>
                      <Button 
                        type="button" 
                        variant={previewMode === "mobile" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPreviewMode("mobile")}
                        className="h-8"
                      >
                        Mobile
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <Tabs defaultValue="code" className="h-full flex flex-col">
                    <div className="border-b px-4">
                      <TabsList className="h-12">
                        <TabsTrigger value="code">HTML Code</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="code" className="flex-1 mt-0">
                      <FormField
                        control={form.control}
                        name="htmlContent"
                        render={({ field }) => (
                          <FormItem className="h-full">
                            <FormControl>
                              <Textarea
                                placeholder="HTML content of your email template"
                                className="min-h-[500px] h-full font-mono text-sm p-4 rounded-none border-0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="p-2" />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-0 flex-1">
                      <div className={`bg-gray-100 h-full p-4 overflow-auto ${
                        previewMode === "mobile" ? "max-w-sm mx-auto" : ""
                      }`}>
                        <div className="bg-white shadow-sm">
                          <div className="border-b p-2 bg-gray-50">
                            <div className="font-medium">{form.watch("subject") || "Email Subject"}</div>
                          </div>
                          <iframe
                            srcDoc={htmlContent}
                            title="Email Preview"
                            className="w-full border-0"
                            style={{ height: "600px" }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t flex justify-between p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/email")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Saving Template...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Template
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}