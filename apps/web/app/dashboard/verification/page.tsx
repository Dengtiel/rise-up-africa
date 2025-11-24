"use client";

import { useState, useEffect } from "react";
import { userApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import type { Verification } from "@/lib/types";
import { IconCheck, IconX, IconClock, IconFileCheck } from "@tabler/icons-react";

export default function VerificationPage() {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerification();
  }, []);

  const loadVerification = async () => {
    try {
      const data = await userApi.getVerification();
      setVerification(data);
    } catch (error) {
      console.error("Failed to load verification:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-500">
            <IconCheck className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <IconX className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-blue-500">
            <IconFileCheck className="mr-1 h-3 w-3" />
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <IconClock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return 100;
      case "REJECTED":
        return 0;
      case "UNDER_REVIEW":
        return 50;
      default:
        return 25;
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

  if (!verification) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Verification Status</h2>
          <p className="text-muted-foreground">Track your verification progress</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              No verification record found. Please complete your profile and upload documents.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verification Status</h2>
        <p className="text-muted-foreground">Track your verification progress</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Your verification is currently {verification.status.toLowerCase()}
              </CardDescription>
            </div>
            {getStatusBadge(verification.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{getStatusProgress(verification.status)}%</span>
            </div>
            <Progress value={getStatusProgress(verification.status)} />
          </div>

          {verification.adminNotes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Admin Notes</h4>
              <p className="text-sm text-muted-foreground">{verification.adminNotes}</p>
            </div>
          )}

          {verification.fieldNotes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Field Agent Notes</h4>
              <p className="text-sm text-muted-foreground">{verification.fieldNotes}</p>
            </div>
          )}

          {verification.verifiedAt && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Verified At</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(verification.verifiedAt).toLocaleString()}
              </p>
            </div>
          )}

          {verification.fieldVisits && verification.fieldVisits.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Field Visits</h4>
              <div className="space-y-2">
                {verification.fieldVisits.map((visit) => (
                  <div key={visit.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          Visit on {new Date(visit.visitDate).toLocaleDateString()}
                        </p>
                        {visit.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {visit.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

