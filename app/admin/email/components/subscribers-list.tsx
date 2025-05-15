"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileDown,
  Loader2,
  MailPlus,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

// Subscriber type definition
type Subscriber = {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'inactive' | 'unsubscribed';
  name?: string;
  lastEmailSent?: string;
  lastEmailOpened?: string;
  source?: string;
};

export function SubscribersList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [newName, setNewName] = useState("");
  const [currentSubscriber, setCurrentSubscriber] = useState<Subscriber | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (subscribers.length > 0) {
      filterSubscribers();
    }
  }, [searchTerm, statusFilter, subscribers]);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/email/subscribers");
      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }
      
      const data = await response.json();
      setSubscribers(data);
      setFilteredSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscribers = () => {
    let filtered = [...subscribers];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) => 
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }
    
    setFilteredSubscribers(filtered);
  };

  const handleAddSubscriber = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if this email already exists in our current subscriber list
      const emailExists = subscribers.some(sub => 
        sub.email.toLowerCase() === newEmail.toLowerCase()
      );
      
      if (emailExists) {
        toast.error("This email is already subscribed");
        return;
      }
      
      const response = await fetch("/api/admin/email/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail,
          name: newName || undefined,
          status: newStatus,
          source: "admin-dashboard",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "This email is already subscribed") {
          toast.error("This email is already in the subscriber list");
          
          // Update our local subscribers list to include this email if it's not there
          const existingSubscriberSnapshot = await fetch(`/api/admin/email/subscribers?email=${encodeURIComponent(newEmail)}`);
          if (existingSubscriberSnapshot.ok) {
            const existingSubscriber = await existingSubscriberSnapshot.json();
            if (existingSubscriber && existingSubscriber.length > 0) {
              // Add this subscriber to our local list if it's not already there
              const alreadyInList = subscribers.some(s => s.id === existingSubscriber[0].id);
              if (!alreadyInList) {
                setSubscribers(prev => [...prev, existingSubscriber[0]]);
              }
            }
          }
          
          return;
        }
        throw new Error(data.error || "Failed to add subscriber");
      }

      const newSubscriber = await response.json();
      setSubscribers([newSubscriber, ...subscribers]);
      toast.success("Subscriber added successfully");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding subscriber:", error);
      toast.error(error.message || "Failed to add subscriber");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubscriber = async () => {
    if (!currentSubscriber || !currentSubscriber.email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/email/subscribers/${currentSubscriber.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentSubscriber.email,
          name: currentSubscriber.name || undefined,
          status: currentSubscriber.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update subscriber");
      }

      const updatedSubscriber = await response.json();
      setSubscribers(
        subscribers.map((sub) => (sub.id === updatedSubscriber.id ? updatedSubscriber : sub))
      );
      
      toast.success("Subscriber updated successfully");
      setIsEditDialogOpen(false);
      setCurrentSubscriber(null);
    } catch (error: any) {
      console.error("Error updating subscriber:", error);
      toast.error(error.message || "Failed to update subscriber");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!currentSubscriber) return;

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/email/subscribers/${currentSubscriber.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete subscriber");
      }

      setSubscribers(subscribers.filter((sub) => sub.id !== currentSubscriber.id));
      toast.success("Subscriber deleted successfully");
      setIsDeleteDialogOpen(false);
      setCurrentSubscriber(null);
    } catch (error: any) {
      console.error("Error deleting subscriber:", error);
      toast.error(error.message || "Failed to delete subscriber");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (subscriber: Subscriber, newStatus: 'active' | 'inactive' | 'unsubscribed') => {
    try {
      const response = await fetch(`/api/admin/email/subscribers/${subscriber.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      const updatedSubscriber = await response.json();
      setSubscribers(
        subscribers.map((sub) => (sub.id === updatedSubscriber.id ? updatedSubscriber : sub))
      );
      
      toast.success(`Subscriber status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const exportSubscribers = (format: 'csv' | 'json') => {
    try {
      let content: string;
      let fileName: string;
      
      if (format === 'csv') {
        // Create CSV content
        const headers = ['Email', 'Name', 'Status', 'Subscribed At', 'Source'];
        const rows = filteredSubscribers.map(sub => 
          [
            sub.email, 
            sub.name || '', 
            sub.status, 
            sub.subscribedAt, 
            sub.source || 'website'
          ].join(',')
        );
        
        content = [headers.join(','), ...rows].join('\n');
        fileName = `subscribers-${format}.csv`;
      } else {
        // Create JSON content
        content = JSON.stringify(filteredSubscribers, null, 2);
        fileName = `subscribers-${format}.json`;
      }
      
      // Create a download link
      const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExportDialogOpen(false);
      toast.success(`Exported ${filteredSubscribers.length} subscribers as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast.error("Failed to export subscribers");
    }
  };

  const resetForm = () => {
    setNewEmail("");
    setNewName("");
    setNewStatus("active");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'inactive':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case 'unsubscribed':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Email Subscribers</CardTitle>
              <CardDescription>
                Manage your newsletter subscribers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subscriber
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {statusFilter ? (
                    <>Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</>
                  ) : (
                    <>All Statuses</>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  <Pause className="mr-2 h-4 w-4 text-yellow-600" />
                  Inactive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("unsubscribed")}>
                  <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                  Unsubscribed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No subscribers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Start by adding a subscriber to your newsletter"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subscriber
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        {subscriber.name || <span className="text-muted-foreground italic">Not provided</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscriber.status)}>
                          {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscriber.subscribedAt ? (
                          format(new Date(subscriber.subscribedAt), "MMM d, yyyy")
                        ) : (
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell>
                        {subscriber.source || "Website"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => {
                              setCurrentSubscriber(subscriber);
                              setIsEditDialogOpen(true);
                            }}>
                              Edit
                            </DropdownMenuItem>
                            
                            {subscriber.status !== "active" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(subscriber, "active")}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            
                            {subscriber.status !== "inactive" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(subscriber, "inactive")}>
                                <Pause className="mr-2 h-4 w-4 text-yellow-600" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            
                            {subscriber.status !== "unsubscribed" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(subscriber, "unsubscribed")}>
                                <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                                Unsubscribe
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setCurrentSubscriber(subscriber);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredSubscribers.length} of {subscribers.length} subscribers
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Subscriber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>
              Add a new subscriber to your newsletter list
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email*
              </label>
              <Input
                id="email"
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name (optional)
              </label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <MailPlus className="mr-2 h-4 w-4" />
                  Add Subscriber
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscriber Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>
              Update subscriber details
            </DialogDescription>
          </DialogHeader>
          {currentSubscriber && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email*
                </label>
                <Input
                  id="edit-email"
                  value={currentSubscriber.email}
                  onChange={(e) =>
                    setCurrentSubscriber({
                      ...currentSubscriber,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Name (optional)
                </label>
                <Input
                  id="edit-name"
                  placeholder="John Doe"
                  value={currentSubscriber.name || ""}
                  onChange={(e) =>
                    setCurrentSubscriber({
                      ...currentSubscriber,
                      name: e.target.value || undefined,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="edit-status"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={currentSubscriber.status}
                  onChange={(e) =>
                    setCurrentSubscriber({
                      ...currentSubscriber,
                      status: e.target.value as 'active' | 'inactive' | 'unsubscribed',
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentSubscriber(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubscriber} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subscriber Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscriber</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentSubscriber && (
            <div className="py-4">
              <p className="mb-2">
                <span className="font-medium">Email:</span> {currentSubscriber.email}
              </p>
              {currentSubscriber.name && (
                <p className="mb-2">
                  <span className="font-medium">Name:</span> {currentSubscriber.name}
                </p>
              )}
              <p>
                <span className="font-medium">Status:</span>{" "}
                <Badge className={getStatusColor(currentSubscriber.status)}>
                  {currentSubscriber.status.charAt(0).toUpperCase() + currentSubscriber.status.slice(1)}
                </Badge>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCurrentSubscriber(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubscriber}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Subscriber"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Subscribers</DialogTitle>
            <DialogDescription>
              Choose a format to export your subscribers list
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              You will export {filteredSubscribers.length} subscribers
              {searchTerm || statusFilter ? " (filtered)" : ""}.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => exportSubscribers("csv")}
              >
                <FileDown className="h-8 w-8" />
                CSV Format
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col gap-2"
                onClick={() => exportSubscribers("json")}
              >
                <Download className="h-8 w-8" />
                JSON Format
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}