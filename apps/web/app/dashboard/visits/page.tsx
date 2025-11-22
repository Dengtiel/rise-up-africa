"use client";

import { useEffect, useState } from "react";
import { verificationApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import DashboardHeader from "@/components/dashboard-header";
import type { FieldVisit, Verification } from "@/lib/types";

export default function VisitsPage() {
  const [visits, setVisits] = useState<Array<{
    visit: FieldVisit;
    verification: Verification;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
    const id = setInterval(loadVisits, 15000); // refresh every 15s so scheduled visits appear
    return () => clearInterval(id);
  }, []);

  const loadVisits = async () => {
    try {
      const verifications = await verificationApi.getFieldAgentVerifications();
      // Flatten fieldVisits
      const items: Array<{ visit: FieldVisit; verification: Verification }> = [];
      verifications.forEach((v) => {
        v.fieldVisits?.forEach((fv) => items.push({ visit: fv, verification: v }));
      });
      // sort by visit date desc
      items.sort((a, b) => new Date(b.visit.visitDate).getTime() - new Date(a.visit.visitDate).getTime());
      setVisits(items);
    } catch (error) {
      console.error("Failed to load visits:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Field Visits" subtitle="Record and manage field visits" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Field Visits</CardTitle>
              <CardDescription>Visits scheduled or recorded for your assignments</CardDescription>
            </div>
            <Badge variant="outline">{loading ? "Loading" : `${visits.length} visits`}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No visits found</div>
          ) : (
            <div className="space-y-4">
              {visits.map(({ visit, verification }) => (
                <div key={visit.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">Visit on {new Date(visit.visitDate).toLocaleString()}</p>
                      {visit.notes && <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>}
                      <p className="text-sm text-muted-foreground mt-2">Youth: {verification.user?.firstName} {verification.user?.lastName} ({verification.user?.email})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Status</p>
                      <Badge variant="outline" className="mt-1">{verification.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
