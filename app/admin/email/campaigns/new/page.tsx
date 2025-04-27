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
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  Calendar,
  Plus,
  X,
  Upload,
  Clock,
  Send,
  ArrowLeft,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { EmailTemplate } from "@/lib/email-service";

const EMAIL_TEMPLATES = [
  { id: "newsletter", label: "Newsletter" },
  { id: "legal-alert", label: "Legal Alert" },
  { id: "document-shared", label: "Document Share" },
  { id: "weekly-summary", label: "Weekly Summary" },
  { id: "custom", label: "Custom Email" },
];

interface Recipient {
  email: string;
  name?: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});
  const [customHtml, setCustomHtml] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [uploadedRecipients, setUploadedRecipients] = useState<Recipient[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/admin/email");
    }
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!name || !subject || !selectedTemplate) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (step === 2) {
      if (recipients.length === 0) {
        toast.error("Please add at least one recipient");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const addRecipient = () => {
    if (!recipientEmail) {
      toast.error("Email is required");
      return;
    }

    if (!recipientEmail.includes('@')) {
      toast.error("Invalid email format");
      return;
    }

    const newRecipient = {
      email: recipientEmail,
      name: recipientName || undefined,
    };

    setRecipients([...recipients, newRecipient]);
    setRecipientEmail("");
    setRecipientName("");
  };

  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    // Read uploaded CSV file
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;

      try {
        const content = event.target.result as string;
        const rows = content.split('\n');
        const uploadedRecipients: Recipient[] = [];

        rows.forEach((row, index) => {
          if (!row.trim()) return;
          const [email, name] = row.split(',').map(val => val.trim());

          if (email && email.includes('@')) {
            uploadedRecipients.push({
              email,
              name: name || undefined
            });
          }
        });

        setUploadedRecipients(uploadedRecipients);
        toast.success(`Found ${uploadedRecipients.length} valid recipients`);
      } catch (error) {
        toast.error("Error parsing CSV file. Make sure the format is correct.");
      }
    };

    reader.readAsText(file);
  };

  const handleRecipientImport = () => {
    if (uploadedRecipients.length) {
      setRecipients([...recipients, ...uploadedRecipients]);
      setUploadedRecipients([]);
      toast.success("Recipients imported successfully");
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    setAttachments([...attachments, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleTemplateChange = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Reset template data when template changes
    setTemplateData({});
    setCustomHtml("");
  };

  const handleTemplateDataChange = (key: string, value: any) => {
    setTemplateData({
      ...templateData,
      [key]: value
    });
  };

  const handleCreateCampaign = async () => {
    if (!name || !subject || !selectedTemplate || recipients.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Prepare campaign data
      const campaignData = {
        name,
        subject,
        template: selectedTemplate,
        recipients,
        data: templateData,
        // If sendNow is false, use the scheduled date
        scheduledFor: !sendNow && scheduledFor ? scheduledFor.toISOString() : undefined,
      };
      
      // For custom templates, add the HTML content
      if (selectedTemplate === 'custom') {
        campaignData.data.htmlContent = customHtml;
      }
      
      // Send campaign creation request
      const response = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create campaign');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(sendNow 
          ? "Campaign sent successfully!"
          : "Campaign scheduled successfully!");
        
        router.push('/admin/email');
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast.error(String(error) || 'Failed to create campaign');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Email Campaign</h1>
            <p className="text-muted-foreground">
              Create and send a new campaign to your users.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="py-1.5">
            Step {step} of 3
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left sidebar - Steps */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Setup</CardTitle>
              <CardDescription>
                Complete these steps to create your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className={`flex items-center p-3 rounded-md gap-3 border ${
                  step === 1 ? 'bg-primary/10 border-primary' : 'border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  1
                </div>
                <div>
                  <div className="font-medium">Campaign Details</div>
                  <div className="text-sm text-muted-foreground">Set name, subject and content</div>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-3 rounded-md gap-3 border ${
                  step === 2 ? 'bg-primary/10 border-primary' : 'border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  2
                </div>
                <div>
                  <div className="font-medium">Recipients</div>
                  <div className="text-sm text-muted-foreground">Who will receive this email</div>
                </div>
              </div>
              
              <div 
                className={`flex items-center p-3 rounded-md gap-3 border ${
                  step === 3 ? 'bg-primary/10 border-primary' : 'border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}>
                  3
                </div>
                <div>
                  <div className="font-medium">Schedule & Review</div>
                  <div className="text-sm text-muted-foreground">When to send and final review</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Current step */}
        <div className="md:col-span-2">
          {/* Step 1: Campaign Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Set up the basic information about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. April Newsletter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Internal name for this campaign (not visible to recipients)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g. Important Updates from PocketLawyer"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EMAIL_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleTemplateChange(template.id as EmailTemplate)}
                      >
                        <div className="font-medium">{template.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Template-specific fields */}
                {selectedTemplate && selectedTemplate !== 'custom' && (
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="font-medium">Template Content</h3>
                    
                    {/* Newsletter fields */}
                    {selectedTemplate === 'newsletter' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="title">Newsletter Title</Label>
                          <Input
                            id="title"
                            placeholder="April 2025 Legal Updates"
                            value={templateData.title || ''}
                            onChange={(e) => handleTemplateDataChange('title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Newsletter Content</Label>
                          <Textarea
                            id="content"
                            placeholder="HTML content for your newsletter..."
                            rows={5}
                            value={templateData.content || ''}
                            onChange={(e) => handleTemplateDataChange('content', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="callToAction.text">Button Text</Label>
                            <Input
                              id="callToAction.text"
                              placeholder="Read More"
                              value={templateData.callToAction?.text || ''}
                              onChange={(e) => 
                                handleTemplateDataChange('callToAction', {
                                  ...templateData.callToAction || {},
                                  text: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="callToAction.link">Button Link</Label>
                            <Input
                              id="callToAction.link"
                              placeholder="https://pocketlawyer.com/blog"
                              value={templateData.callToAction?.link || ''}
                              onChange={(e) => 
                                handleTemplateDataChange('callToAction', {
                                  ...templateData.callToAction || {},
                                  link: e.target.value
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Legal Alert fields */}
                    {selectedTemplate === 'legal-alert' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="alertType">Alert Type</Label>
                          <Select 
                            value={templateData.alertType || 'Legal Update'}
                            onValueChange={(value) => handleTemplateDataChange('alertType', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select alert type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Legal Update">Legal Update</SelectItem>
                              <SelectItem value="Regulatory Change">Regulatory Change</SelectItem>
                              <SelectItem value="Court Decision">Court Decision</SelectItem>
                              <SelectItem value="Compliance Alert">Compliance Alert</SelectItem>
                              <SelectItem value="Law Change">Law Change</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="headline">Alert Headline</Label>
                          <Input
                            id="headline"
                            placeholder="New Employment Law Coming into Effect"
                            value={templateData.headline || ''}
                            onChange={(e) => handleTemplateDataChange('headline', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alertContent">Alert Content</Label>
                          <Textarea
                            id="alertContent"
                            placeholder="Details about the legal update..."
                            rows={4}
                            value={templateData.alertContent || ''}
                            onChange={(e) => handleTemplateDataChange('alertContent', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="actionRequired">Action Required</Label>
                          <Input
                            id="actionRequired"
                            placeholder="Leave blank if no action is required"
                            value={templateData.actionRequired || ''}
                            onChange={(e) => handleTemplateDataChange('actionRequired', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link">Link to Details</Label>
                          <Input
                            id="link"
                            placeholder="https://pocketlawyer.com/alerts/details"
                            value={templateData.link || ''}
                            onChange={(e) => handleTemplateDataChange('link', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Add other template specific fields here */}
                  </div>
                )}
                
                {/* Custom HTML editor */}
                {selectedTemplate === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customHtml">Custom HTML Content</Label>
                    <Textarea
                      id="customHtml"
                      placeholder="<h1>Your custom HTML content here</h1>"
                      rows={10}
                      value={customHtml}
                      onChange={(e) => setCustomHtml(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="border rounded-md p-4">
                    {attachments.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {attachments.map((file, i) => (
                          <div 
                            key={`${file.name}-${i}`}
                            className="flex items-center justify-between border rounded p-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="text-sm truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ({Math.round(file.size / 1024)} KB)
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeAttachment(i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Separator className="my-4" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <Label htmlFor="attachment" className="cursor-pointer">
                        <div className="border border-dashed rounded-md p-6 text-center hover:bg-muted/50 transition-colors">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Drop files or click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, Word, Excel, and image files supported
                          </p>
                        </div>
                        <Input 
                          id="attachment" 
                          type="file" 
                          className="hidden" 
                          onChange={handleAttachmentUpload}
                        />
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button onClick={handleNext}>
                  Continue
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Recipients */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Recipients</CardTitle>
                <CardDescription>
                  Choose who should receive this email campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Add Recipients</h3>
                  
                  <div className="space-y-4">
                    {/* Add individual recipients */}
                    <div className="space-y-2">
                      <Label htmlFor="recipientEmail">Email Address</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="recipientEmail"
                          placeholder="user@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                        />
                        <Input
                          id="recipientName"
                          placeholder="Name (optional)"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                        <Button 
                          variant="outline"
                          onClick={addRecipient}
                          className="shrink-0"
                          type="button"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Import from CSV */}
                    <div className="space-y-2">
                      <Label>Import Recipients from CSV</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a CSV file with email,name format (name is optional)
                      </p>
                      
                      <div className="flex space-x-2">
                        <Input 
                          type="file" 
                          accept=".csv" 
                          onChange={handleFileUpload}
                        />
                        <Button 
                          variant="outline"
                          onClick={handleRecipientImport}
                          disabled={uploadedRecipients.length === 0}
                          className="shrink-0"
                        >
                          Import
                        </Button>
                      </div>
                      
                      {uploadedRecipients.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-2">
                          {uploadedRecipients.length} recipients found in file
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Recipient List</h3>
                    <div className="text-sm text-muted-foreground">
                      {recipients.length} recipients
                    </div>
                  </div>
                  
                  {recipients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="mx-auto h-10 w-10 mb-2 opacity-25" />
                      <p>No recipients added yet</p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {recipients.map((recipient, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div>
                            <div className="font-medium">{recipient.email}</div>
                            {recipient.name && (
                              <div className="text-sm text-muted-foreground">
                                {recipient.name}
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeRecipient(i)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={recipients.length === 0}>
                  Continue
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Schedule & Review */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Review</CardTitle>
                <CardDescription>
                  Set when to send your campaign and review details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-md p-4 space-y-4">
                  <h3 className="font-medium">Delivery Options</h3>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <Label htmlFor="sendNow" className="cursor-pointer">
                        Send immediately
                      </Label>
                    </div>
                    <Switch
                      id="sendNow"
                      checked={sendNow}
                      onCheckedChange={setSendNow}
                    />
                  </div>
                  
                  {!sendNow && (
                    <div className="space-y-2 pt-2">
                      <Label>Schedule For</Label>
                      <DateTimePicker 
                        date={scheduledFor} 
                        setDate={setScheduledFor}
                        granularity="minute"
                        disabled={false}
                      />
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Review Campaign</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Campaign Name</div>
                        <div className="font-medium">{name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Template</div>
                        <div className="font-medium">
                          {EMAIL_TEMPLATES.find(t => t.id === selectedTemplate)?.label || 'None'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Subject</div>
                        <div className="font-medium">{subject}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Recipients</div>
                        <div className="font-medium">{recipients.length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Delivery</div>
                        <div className="font-medium">
                          {sendNow 
                            ? 'Immediately after submission' 
                            : scheduledFor 
                              ? `Scheduled for ${scheduledFor.toLocaleString()}`
                              : 'Not scheduled'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Attachments</div>
                        <div className="font-medium">
                          {attachments.length ? `${attachments.length} files` : 'None'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="text-sm text-muted-foreground mb-2">Note</div>
                      <p className="text-sm">
                        Please review all details carefully. Once sent, emails cannot be recalled.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!sendNow && !scheduledFor}>
                  {sendNow ? 'Send Now' : 'Schedule Campaign'}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {sendNow ? 'Send' : 'Schedule'}</DialogTitle>
            <DialogDescription>
              {sendNow 
                ? `This will immediately send your email to ${recipients.length} recipients.`
                : `This will schedule your email for ${scheduledFor?.toLocaleString()} to ${recipients.length} recipients.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="font-medium">{subject}</div>
            <div className="text-sm text-muted-foreground">
              Campaign: {name}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={loading}>
              {loading ? 'Processing...' : sendNow ? 'Confirm & Send' : 'Confirm & Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}