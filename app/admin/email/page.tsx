"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Mail, 
  Calendar, 
  LineChart, 
  BarChart, 
  PieChart, 
  Plus, 
  Search, 
  RefreshCw,
  Clock,
  Check,
  AlertTriangle,
  X,
  Eye
} from "lucide-react";

// Define campaign status badge styles
const STATUS_BADGES = {
  scheduled: { variant: "outline", icon: Clock, text: "Scheduled" },
  processing: { variant: "secondary", icon: RefreshCw, text: "Processing" },
  completed: { variant: "success", icon: Check, text: "Completed" },
  failed: { variant: "destructive", icon: AlertTriangle, text: "Failed" },
  cancelled: { variant: "default", icon: X, text: "Cancelled" },
};

export default function AdminEmailDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30days");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch campaigns
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch analytics when timeframe changes
  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab, timeframe]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/email/campaigns");
      
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      toast.error("Failed to load email campaigns");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/email/analytics?period=${timeframe}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast.error("Failed to load email analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    router.push("/admin/email/campaigns/new");
  };

  const handleViewCampaign = (id: string) => {
    router.push(`/admin/email/campaigns/${id}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (campaign.name?.toLowerCase().includes(query)) ||
      (campaign.subject?.toLowerCase().includes(query)) ||
      (campaign.status?.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Manage email campaigns, view analytics, and schedule automated emails.
          </p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="campaigns" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <LineChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search campaigns..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchCampaigns}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>
                Manage your email campaigns and track their performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium">No campaigns found</h3>
                  <p className="text-muted-foreground">
                    Create your first email campaign to get started.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Scheduled/Sent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map((campaign) => {
                        const status = campaign.status || "scheduled";
                        const Badge = STATUS_BADGES[status as keyof typeof STATUS_BADGES];
                        const Icon = Badge?.icon || Clock;
                        
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">
                              <div className="truncate max-w-[200px]">
                                <div className="font-medium">{campaign.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {campaign.subject}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={Badge.variant} 
                                className="flex items-center gap-1 whitespace-nowrap"
                              >
                                <Icon className="h-3 w-3" />
                                {Badge.text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {campaign.totalCount || campaign.recipients?.length || 0}
                                {status === "completed" && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({campaign.sentCount} delivered)
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {status === "scheduled" 
                                ? formatDate(campaign.scheduledFor)
                                : formatDate(campaign.completedAt || campaign.createdAt)
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewCampaign(campaign.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <Label>Time Period</Label>
              <Select 
                value={timeframe} 
                onValueChange={setTimeframe}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="alltime">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full" />
              ))}
            </div>
          ) : !analytics ? (
            <Card>
              <CardContent className="text-center py-8">
                <LineChart className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-lg font-medium">No analytics data available</h3>
                <p className="text-muted-foreground">
                  Send some emails first to see analytics data.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Total Emails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics.summary.totalEmails.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Open Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics.summary.openRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Click Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics.summary.clickRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {analytics.summary.totalCampaigns}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart would go here - placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Email Performance</CardTitle>
                    <CardDescription>
                      Open and click rates over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <LineChart className="mx-auto h-8 w-8 mb-2" />
                      <p>Analytics chart would render here</p>
                      <p className="text-xs">(Requires chart library integration)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Template Performance</CardTitle>
                    <CardDescription>
                      Effectiveness of different email templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.templatePerformance.slice(0, 5).map((template: any) => (
                        <div key={template.template} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{template.template}</span>
                            <span className="text-muted-foreground text-sm">
                              {template.totalSent.toLocaleString()} sent
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-muted h-2 flex-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary h-full" 
                                style={{ width: `${Math.min(100, template.openRate)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium w-10">
                              {template.openRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}