"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink } from "lucide-react";
import Link from "next/link";

type TemplatePerformance = {
  template: string;
  templateId: string;
  totalSent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
};

export function RenderTemplateTable({ data }: { data: TemplatePerformance[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead className="text-right">Total Sent</TableHead>
            <TableHead className="text-right">Open Rate</TableHead>
            <TableHead className="text-right">Click Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((template) => (
            <TableRow key={template.templateId}>
              <TableCell className="font-medium">{template.template}</TableCell>
              <TableCell className="text-right">
                {template.totalSent.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {template.openRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                {template.clickRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/email/templates/${template.templateId}`}>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/email/templates/${template.templateId}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No template data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}