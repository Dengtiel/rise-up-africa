"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { applicationApi, opportunityApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import type { Application, Opportunity } from "@/lib/types";

export default function OpportunityApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  const loadData = async () => {
    try {
      const [oppData, appData] = await Promise.all([
        opportunityApi.getOpportunity(params.id as string),
        applicationApi.getOpportunityApplications(params.id as string),
      ]);
      setOpportunity(oppData);
      setApplications(appData);
    } catch (error) {
      toast.error("Failed to load data");
      router.push("/dashboard/opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    setUpdating(applicationId);
    try {
      await applicationApi.updateApplicationStatus(applicationId, status as any);
      toast.success("Application status updated!");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELECTED":
        return <Badge className="bg-green-500">Selected</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-500">Under Review</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          Applications for {opportunity?.title}
        </h2>
        <p className="text-muted-foreground">
          Review and manage applications for this opportunity
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
          <CardDescription>
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No applications yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {app.youth?.firstName} {app.youth?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {app.youth?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {app.youth?.category || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {app.youth?.country || "N/A"}
                        {app.youth?.camp && (
                          <div className="text-muted-foreground">
                            {app.youth.camp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(app.id, value)
                        }
                        disabled={updating === app.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="SELECTED">Selected</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

