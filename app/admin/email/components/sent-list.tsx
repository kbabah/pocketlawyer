"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, Loader2, Search, Mail, Inbox, MousePointer, AlertTriangle } from "lucide-react";

interface SentEmail {
  id: string;
  subject: string;
  recipients: { email: string; name?: string }[];
  template: string;
  sentAt: string;
  campaignId?: string;
  status: string;
  stats: {
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

interface EmailDetails {
  id: string;
  subject: string;
  recipient: string;
  sentAt: string;
  template: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  bounced: boolean;
  bouncedAt?: string;
  links?: { url: string; clicks: number }[];
}

export function SentEmailsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<EmailDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch sent emails
  useEffect(() => {
    fetchSentEmails();
  }, []);

  async function fetchSentEmails() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/email/campaigns?status=completed,failed");
      
      if (!response.ok) {
        throw new Error("Failed to fetch sent emails");
      }
      
      const data = await response.json();
      setSentEmails(data.campaigns || []);
    } catch (error) {
      console.error("Failed to fetch sent emails:", error);
      toast.error("Failed to load sent emails");
    } finally {
      setIsLoading(false);
    }
  }

  // View email details
  async function viewEmailDetails(id: string) {
    try {
      setIsLoadingDetails(true);
      const response = await fetch(`/api/admin/email/campaigns/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch email details");
      }
      
      const data = await response.json();
      
      // Convert the campaign data to the expected EmailDetails format
      if (data.recipients && data.recipients.length > 0) {
        // For simplicity, just show the first recipient's details
        const firstRecipient = data.recipients[0];
        setSelectedEmail({
          id: data.id,
          subject: data.subject,
          recipient: firstRecipient.email,
          sentAt: firstRecipient.sentAt || data.sentAt,
          template: data.templateName,
          opened: firstRecipient.opened,
          openedAt: firstRecipient.openedAt,
          clicked: firstRecipient.clicked,
          clickedAt: firstRecipient.clickedAt,
          bounced: firstRecipient.bounced,
          bouncedAt: firstRecipient.bouncedAt,
          links: data.popularLinks || []
        });
      } else {
        // Fallback if no recipient details
        setSelectedEmail({
          id: data.id,
          subject: data.subject,
          recipient: "No recipient details available",
          sentAt: data.sentAt,
          template: data.templateName,
          opened: false,
          clicked: false,
          bounced: false,
          links: data.popularLinks || []
        });
      }
    } catch (error) {
      console.error("Failed to fetch email details:", error);
      toast.error("Failed to load email details");
      setSelectedEmail(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }

  // Filter emails based on search query
  const filteredEmails = sentEmails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.recipients.some(r => 
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sent Emails</CardTitle>
            <CardDescription>
              View sent email campaigns and their performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No sent emails match your search"
                : "No sent emails found"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">{email.subject}</TableCell>
                  <TableCell>
                    {email.recipients.length} recipient{email.recipients.length !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>{email.template}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {email.sentAt && !isNaN(new Date(email.sentAt).getTime()) ? format(new Date(email.sentAt), "PPp") : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1" title="Delivered">
                        <Inbox className="h-4 w-4 text-muted-foreground" />
                        <span>{email.stats?.delivered || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Opened">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{email.stats?.opened || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Clicked">
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                        <span>{email.stats?.clicked || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Bounced">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <span>{email.stats?.bounced || 0}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => viewEmailDetails(email.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px]">
                        <SheetHeader>
                          <SheetTitle>Email Details</SheetTitle>
                          <SheetDescription>
                            View detailed information about this sent email
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6">
                          {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          ) : selectedEmail ? (
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Subject</h4>
                                <p className="text-sm text-muted-foreground">{selectedEmail.subject}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Recipient</h4>
                                <p className="text-sm text-muted-foreground">{selectedEmail.recipient}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Template</h4>
                                <p className="text-sm text-muted-foreground">{selectedEmail.template}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Status</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      Sent on {format(new Date(selectedEmail.sentAt), "PPp")}
                                    </span>
                                  </div>
                                  {selectedEmail.opened && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-green-500" />
                                      <span className="text-sm">
                                        Opened on {format(new Date(selectedEmail.openedAt!), "PPp")}
                                      </span>
                                    </div>
                                  )}
                                  {selectedEmail.clicked && (
                                    <div className="flex items-center gap-2">
                                      <MousePointer className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm">
                                        Clicked on {format(new Date(selectedEmail.clickedAt!), "PPp")}
                                      </span>
                                    </div>
                                  )}
                                  {selectedEmail.bounced && (
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-destructive" />
                                      <span className="text-sm">
                                        Bounced on {format(new Date(selectedEmail.bouncedAt!), "PPp")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {selectedEmail.links && selectedEmail.links.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Clicked Links</h4>
                                  <div className="space-y-2">
                                    {selectedEmail.links.map((link, index) => (
                                      <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground truncate max-w-[300px]">
                                          {link.url}
                                        </span>
                                        <Badge variant="secondary">{link.clicks} clicks</Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Failed to load email details</p>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}