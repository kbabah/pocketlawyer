"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BarChart2, ExternalLink, MoreHorizontal, Pause, Play, Plus, Send, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

type CampaignStatus = "draft" | "scheduled" | "sending" | "completed" | "paused" | "cancelled";

type EmailCampaign = {
  id: string;
  name: string;
  templateId: string;
  status: CampaignStatus;
  recipientCount: number;
  sentCount: number;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
};

export function EmailCampaignsList() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/email/campaigns");
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data = await response.json();
      setCampaigns(data.campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load email campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/email/campaigns/${campaignId}/pause`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to pause campaign");
      }
      
      toast.success("Campaign paused successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error pausing campaign:", error);
      toast.error("Failed to pause campaign");
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/admin/email/campaigns/${campaignId}/resume`, {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to resume campaign");
      }
      
      toast.success("Campaign resumed successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error resuming campaign:", error);
      toast.error("Failed to resume campaign");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/email/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }
      
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast.error("Failed to delete campaign");
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: CampaignStatus) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "sending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "paused": return "bg-orange-100 text-orange-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4 flex-1">
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CampaignStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => router.push("/admin/email/campaigns/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Recipients</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading campaigns...
                </TableCell>
              </TableRow>
            ) : filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "No campaigns found matching your filters"
                    : "No email campaigns created yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {(campaign.recipientCount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {(campaign.sentCount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {campaign.scheduledDate
                      ? new Date(campaign.scheduledDate).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/email/campaigns/${campaign.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/email/campaigns/${campaign.id}/analytics`)}
                        >
                          <BarChart2 className="w-4 h-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "sending" && (
                          <DropdownMenuItem onClick={() => handlePauseCampaign(campaign.id)}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Sending
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "paused" && (
                          <DropdownMenuItem onClick={() => handleResumeCampaign(campaign.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Resume Sending
                          </DropdownMenuItem>
                        )}
                        {campaign.status === "draft" && (
                          <DropdownMenuItem onClick={() => router.push(`/admin/email/campaigns/${campaign.id}/edit`)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send or Schedule
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}