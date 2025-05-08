"use client";

import { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Clock, 
  FileUp, 
  LayoutTemplate, 
  Loader2, 
  Plus, 
  Search,
  SendHorizonal, 
  Users, 
  X
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";

// Define form schema with zod
const campaignSchema = z.object({
  name: z.string().min(3, {
    message: "Campaign name must be at least 3 characters.",
  }),
  subject: z.string().min(1, {
    message: "Subject is required.",
  }),
  templateId: z.string({
    required_error: "Please select a template.",
  }),
  recipientType: z.enum(["all", "segment", "custom", "file"]),
  segment: z.string().optional(),
  customRecipients: z.string().optional(),
  scheduledFor: z.date().optional(),
  testEmail: z.string().email().optional(),
});

const userSegments = [
  { id: "active", name: "Active Users" },
  { id: "inactive", name: "Inactive Users (30+ days)" },
  { id: "trial", name: "Trial Users" },
  { id: "premium", name: "Premium Users" },
  { id: "new", name: "New Users (Last 7 days)" }
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isCountingRecipients, setIsCountingRecipients] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      templateId: "",
      recipientType: "all",
      segment: "",
      customRecipients: "",
      scheduledFor: undefined,
      testEmail: "",
    },
  });

  // Watch for form value changes
  const recipientType = form.watch("recipientType");
  const segment = form.watch("segment");
  const customRecipients = form.watch("customRecipients");
  const templateId = form.watch("templateId");
  const scheduledFor = form.watch("scheduledFor");

  // Fetch template data
  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoadingTemplates(true);
        const response = await fetch("/api/admin/email/templates");
        
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        
        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast.error("Failed to load email templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    
    fetchTemplates();
  }, []);

  // Update selected template when templateId changes
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === templateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [templateId, templates]);

  // Get recipient count when recipient selection changes
  useEffect(() => {
    if (recipientType === "all" || (recipientType === "segment" && segment)) {
      countRecipients();
    } else if (recipientType === "custom" && customRecipients) {
      // Count custom recipients (simple email count)
      const emails = customRecipients.split(/[\s,;]+/).filter(email => 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      );
      setRecipientCount(emails.length);
    } else if (recipientType === "file" && uploadedFile) {
      // We don't know the exact count from the file yet
      setRecipientCount(null);
    } else {
      setRecipientCount(null);
    }
  }, [recipientType, segment, customRecipients, uploadedFile]);

  // Count recipients based on selection
  const countRecipients = async () => {
    try {
      setIsCountingRecipients(true);
      
      let endpoint = "/api/admin/email/recipients/count";
      if (recipientType === "segment" && segment) {
        endpoint += `?segment=${segment}`;
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error("Failed to count recipients");
      }
      
      const data = await response.json();
      setRecipientCount(data.count);
    } catch (error) {
      console.error("Failed to count recipients:", error);
      toast.error("Failed to count recipients");
      setRecipientCount(null);
    } finally {
      setIsCountingRecipients(false);
    }
  };

  // Handle recipient file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type (CSV or Excel)
    if (!file.name.endsWith('.csv') && !file.name.match(/\.xlsx?$/)) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }
    
    setFileUploading(true);
    setUploadedFile(file);
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file
      const response = await fetch('/api/admin/email/recipients/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const data = await response.json();
      setRecipientCount(data.validEmails || 0);
      toast.success(`File uploaded: ${data.validEmails} valid recipients found`);
    } catch (error) {
      console.error("Failed to upload recipient file:", error);
      toast.error("Failed to process recipient file");
      setUploadedFile(null);
    } finally {
      setFileUploading(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    const testEmail = form.getValues("testEmail");
    if (!testEmail) {
      toast.error("Enter a valid test email address");
      return;
    }
    
    if (!templateId) {
      toast.error("Select a template first");
      return;
    }
    
    try {
      setIsSendingTest(true);
      
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          templateId,
          subject: form.getValues("subject")
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send test email");
      }
      
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error("Failed to send test email:", error);
      toast.error("Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof campaignSchema>) => {
    // Validate if we have recipients
    if (recipientCount === 0) {
      toast.error("No recipients selected for this campaign");
      return;
    }
    
    if (recipientType === "custom" && (!values.customRecipients || values.customRecipients.trim() === "")) {
      toast.error("Please enter recipient email addresses");
      return;
    }
    
    if (recipientType === "file" && !uploadedFile) {
      toast.error("Please upload a recipient file");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare recipients data based on recipientType
      let recipientsData: any = {};
      
      if (recipientType === "all") {
        recipientsData = { type: "all" };
      } else if (recipientType === "segment" && segment) {
        recipientsData = { type: "segment", segment };
      } else if (recipientType === "custom" && values.customRecipients) {
        const emails = values.customRecipients.split(/[\s,;]+/)
          .map(email => email.trim())
          .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        recipientsData = { type: "custom", emails };
      } else if (recipientType === "file" && uploadedFile) {
        recipientsData = { type: "file", fileName: uploadedFile.name };
      }
      
      // Submit campaign creation request
      const response = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          subject: values.subject,
          templateId: values.templateId,
          recipients: recipientsData,
          scheduledFor: values.scheduledFor?.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create campaign");
      }
      
      toast.success("Email campaign created successfully");
      router.push("/admin/email");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">New Email Campaign</h1>
          <p className="text-muted-foreground">
            Create and schedule a new email campaign.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Campaign details */}
            <div className="space-y-6 md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                  <CardDescription>
                    Basic information about your email campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Monthly Newsletter - May" {...field} />
                        </FormControl>
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
                          <Input placeholder="e.g., Your Monthly Legal Update" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is what recipients will see in their inbox.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Template</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingTemplates ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading templates...</span>
                              </div>
                            ) : templates.length === 0 ? (
                              <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">No templates found.</p>
                                <Button 
                                  size="sm" 
                                  variant="link" 
                                  className="mt-2"
                                  type="button"
                                  onClick={() => router.push('/admin/email/templates/new')}
                                >
                                  Create a template first
                                </Button>
                              </div>
                            ) : (
                              templates.map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledFor"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Schedule Sending (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP p")
                                ) : (
                                  "Send immediately"
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <div className="flex justify-between items-center">
                                <div className="text-sm">
                                  Time:
                                </div>
                                <select 
                                  className="text-sm border rounded p-1"
                                  onChange={(e) => {
                                    const time = e.target.value;
                                    if (time && field.value) {
                                      const [hours, minutes] = time.split(':').map(Number);
                                      const newDate = new Date(field.value);
                                      newDate.setHours(hours);
                                      newDate.setMinutes(minutes);
                                      field.onChange(newDate);
                                    }
                                  }}
                                  defaultValue={field.value ? 
                                    `${field.value.getHours().toString().padStart(2, '0')}:${field.value.getMinutes().toString().padStart(2, '0')}` : 
                                    "12:00"
                                  }
                                >
                                  {Array.from({ length: 24 }).map((_, hour) => (
                                    Array.from({ length: 4 }).map((_, minuteIdx) => {
                                      const minute = minuteIdx * 15;
                                      return (
                                        <option 
                                          key={`${hour}-${minute}`} 
                                          value={`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                        >
                                          {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                                        </option>
                                      );
                                    })
                                  )).flat()}
                                </select>
                              </div>
                              
                              {field.value && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => field.onChange(undefined)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Clear
                                </Button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {field.value ? (
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              Campaign will be sent {format(field.value, "EEEE, MMMM d 'at' h:mm a")}
                            </div>
                          ) : (
                            "Campaign will be sent immediately when created"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Test email */}
              <Card>
                <CardHeader>
                  <CardTitle>Test Your Campaign</CardTitle>
                  <CardDescription>
                    Send a test email to verify your template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="testEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Test Email Address</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <Button 
                            type="button" 
                            onClick={sendTestEmail}
                            disabled={isSendingTest || !field.value || !templateId}
                            size="sm"
                          >
                            {isSendingTest ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : "Send Test"}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Recipients and preview */}
            <div className="md:col-span-2 space-y-6">
              {/* Recipients */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Recipients</CardTitle>
                  <CardDescription>
                    Select who will receive this email campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="recipientType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Select Recipients</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div 
                              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                                field.value === 'all' ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => form.setValue('recipientType', 'all')}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox checked={field.value === 'all'} />
                                <div className="font-medium">All Users</div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Send to all active users in the system
                              </p>
                            </div>
                            
                            <div 
                              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                                field.value === 'segment' ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => form.setValue('recipientType', 'segment')}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox checked={field.value === 'segment'} />
                                <div className="font-medium">User Segment</div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Send to a specific user segment
                              </p>
                            </div>
                            
                            <div 
                              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                                field.value === 'custom' ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => form.setValue('recipientType', 'custom')}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox checked={field.value === 'custom'} />
                                <div className="font-medium">Custom Recipients</div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Enter specific email addresses
                              </p>
                            </div>
                            
                            <div 
                              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                                field.value === 'file' ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => form.setValue('recipientType', 'file')}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox checked={field.value === 'file'} />
                                <div className="font-medium">Upload File</div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Upload a CSV or Excel file with email addresses
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Conditional fields based on recipient type */}
                  {recipientType === 'segment' && (
                    <FormField
                      control={form.control}
                      name="segment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Segment</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user segment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userSegments.map(segment => (
                                <SelectItem key={segment.id} value={segment.id}>
                                  {segment.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {recipientType === 'custom' && (
                    <FormField
                      control={form.control}
                      name="customRecipients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter Email Addresses</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter email addresses separated by commas, spaces, or new lines"
                              className="min-h-[120px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Example: user@example.com, another@example.com
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {recipientType === 'file' && (
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Upload Recipient File</FormLabel>
                        <div className="mt-1">
                          <div className="border border-dashed rounded-md p-6 text-center">
                            <input
                              type="file"
                              id="recipients-file"
                              className="hidden"
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileUpload}
                              disabled={fileUploading}
                            />
                            <label 
                              htmlFor="recipients-file"
                              className="cursor-pointer flex flex-col items-center justify-center"
                            >
                              {fileUploading ? (
                                <>
                                  <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
                                  <p className="text-muted-foreground">Uploading file...</p>
                                </>
                              ) : uploadedFile ? (
                                <>
                                  <FileUp className="h-10 w-10 text-primary mb-2" />
                                  <p className="font-medium">{uploadedFile.name}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Click to change file
                                  </p>
                                </>
                              ) : (
                                <>
                                  <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
                                  <p className="font-medium">Click to upload a file</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    CSV or Excel files with email column
                                  </p>
                                </>
                              )}
                            </label>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            File should have a column named "email" or "email_address"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Recipient summary */}
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">Recipients</p>
                      </div>
                      
                      {isCountingRecipients ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">Counting...</span>
                        </div>
                      ) : recipientCount !== null ? (
                        <div className="bg-primary/10 text-primary font-medium px-2 py-1 rounded text-sm">
                          {recipientCount.toLocaleString()} recipients
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          Select recipients
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Template Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                  <CardDescription>
                    Preview how your email will look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedTemplate ? (
                    <div className="text-center py-8 border rounded-md">
                      <div className="text-muted-foreground mb-2">
                        {isLoadingTemplates ? (
                          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                        ) : (
                          <LayoutTemplate className="h-10 w-10 mx-auto mb-4" />
                        )}
                      </div>
                      <p className="font-medium">
                        {isLoadingTemplates ? "Loading templates..." : "Select a template to preview"}
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted/50 p-2 border-b">
                        <div className="font-medium">{form.watch("subject") || "Email Subject"}</div>
                      </div>
                      <iframe
                        srcDoc={selectedTemplate.htmlContent}
                        title="Template Preview"
                        className="w-full border-0"
                        style={{ height: "400px" }}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="ml-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Campaign...
                      </>
                    ) : scheduledFor ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Schedule Campaign
                      </>
                    ) : (
                      <>
                        <SendHorizonal className="mr-2 h-4 w-4" />
                        Create Campaign
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