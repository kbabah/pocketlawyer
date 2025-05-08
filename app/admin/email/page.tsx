"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  Loader2,
  Mail,
  MailCheck,
  Plus,
  ScrollText,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Types for analytics data
type AnalyticsSummary = {
  totalCampaigns: number;
  totalRecipients: number;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  totalBounces: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  period: string;
};

type ChartDataPoint = {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
};

type TemplatePerformance = {
  template: string;
  templateId: string;
  totalSent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
};

type AnalyticsData = {
  summary: AnalyticsSummary;
  chartData: ChartDataPoint[];
  templatePerformance: TemplatePerformance[];
};

export default function EmailDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30days");

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);
      
      const response = await fetch(`/api/admin/email/analytics?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsError("Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Manage email templates, campaigns, and track performance
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/email/templates/new")}
          >
            <ScrollText className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button
            onClick={() => router.push("/admin/email/campaigns/new")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates">
            <ScrollText className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Send className="w-4 h-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled
          </TabsTrigger>
          <TabsTrigger value="sent">
            <MailCheck className="w-4 h-4 mr-2" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoadingAnalytics ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : analyticsError ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Mail className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{analyticsError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={fetchAnalytics}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Analytics Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Emails Sent
                    </CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.summary.totalSent.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In the last {selectedPeriod === "30days" ? "30" : selectedPeriod === "7days" ? "7" : "90"} days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Open Rate
                    </CardTitle>
                    <MailCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.summary.openRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData?.summary.totalOpens.toLocaleString()} emails opened
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Click Rate
                    </CardTitle>
                    <Mouse className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.summary.clickRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData?.summary.totalClicks.toLocaleString()} emails clicked
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Bounce Rate
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsData?.summary.bounceRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData?.summary.totalBounces.toLocaleString()} emails bounced
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Performance</CardTitle>
                  <CardDescription>
                    Email engagement metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <RenderEmailChart data={analyticsData?.chartData || []} />
                </CardContent>
              </Card>

              {/* Template Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Performance</CardTitle>
                  <CardDescription>
                    Performance metrics for email templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RenderTemplateTable data={analyticsData?.templatePerformance || []} />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplatesList />
        </TabsContent>

        <TabsContent value="campaigns">
          <EmailCampaignsList />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledEmailsList />
        </TabsContent>

        <TabsContent value="sent">
          <SentEmailsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Import these components from separate files
import { RenderEmailChart } from "./components/email-chart";
import { RenderTemplateTable } from "./components/template-table";
import { EmailTemplatesList } from "./components/templates-list";
import { EmailCampaignsList } from "./components/campaigns-list";
import { ScheduledEmailsList } from "./components/scheduled-list";
import { SentEmailsList } from "./components/sent-list";
import { AlertCircle, Mouse } from "lucide-react";