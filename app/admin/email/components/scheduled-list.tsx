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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar, Clock, Loader2, MailX, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ScheduledEmail {
  id: string;
  subject: string;
  recipients: { email: string; name?: string }[];
  template: string;
  scheduledFor: string;
  status: 'scheduled' | 'processing' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
}

export function ScheduledEmailsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch scheduled emails
  useEffect(() => {
    fetchScheduledEmails();
  }, []);

  async function fetchScheduledEmails() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/email/campaigns?status=scheduled");
      
      if (!response.ok) {
        throw new Error("Failed to fetch scheduled emails");
      }
      
      const data = await response.json();
      setScheduledEmails(data.campaigns || []);
    } catch (error) {
      console.error("Failed to fetch scheduled emails:", error);
      toast.error("Failed to load scheduled emails");
    } finally {
      setIsLoading(false);
    }
  }

  // Cancel a scheduled email
  async function cancelScheduledEmail(id: string) {
    try {
      setIsCancelling(true);
      const response = await fetch(`/api/admin/email/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to cancel scheduled email");
      }
      
      toast.success("Email cancelled successfully");
      fetchScheduledEmails();
    } catch (error) {
      console.error("Failed to cancel scheduled email:", error);
      toast.error("Failed to cancel scheduled email");
    } finally {
      setIsCancelling(false);
    }
  }

  // Delete a scheduled email
  async function deleteScheduledEmail(id: string) {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/email/campaigns/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete scheduled email");
      }
      
      toast.success("Email deleted successfully");
      fetchScheduledEmails();
    } catch (error) {
      console.error("Failed to delete scheduled email:", error);
      toast.error("Failed to delete scheduled email");
    } finally {
      setIsDeleting(false);
    }
  }

  // Filter emails based on search query
  const filteredEmails = scheduledEmails.filter(email =>
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
            <CardTitle>Scheduled Emails</CardTitle>
            <CardDescription>
              View and manage scheduled email campaigns
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
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No scheduled emails match your search"
                : "No scheduled emails found"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
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
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(email.scheduledFor), "PPP")}
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      {format(new Date(email.scheduledFor), "p")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      email.status === 'scheduled' ? 'default' :
                      email.status === 'processing' ? 'secondary' :
                      email.status === 'sent' ? 'secondary' :
                      email.status === 'failed' ? 'destructive' :
                      'outline'
                    }>
                      {email.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isCancelling || email.status !== 'scheduled'}
                          >
                            <MailX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Scheduled Email</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this scheduled email? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelScheduledEmail(email.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isCancelling ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                "Cancel Email"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isDeleting || email.status !== 'scheduled'}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Scheduled Email</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this scheduled email? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteScheduledEmail(email.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete Email"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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