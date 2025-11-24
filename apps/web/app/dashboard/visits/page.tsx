"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { verificationApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import type { Verification } from "@/lib/types";

export default function VisitsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "FIELD_AGENT") {
      router.push("/dashboard");
      return;
    }

    const load = async () => {
      try {
        const data = await verificationApi.getFieldAgentVerifications();
        setVerifications(data || []);
      } catch (error) {
        // Log error for debugging and show a friendly toast
        // Use console only for development debugging
        console.error("Failed to load visits:", error);
        toast.error("Failed to load visits");
      } finally {
        setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [authLoading, user, router]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Field Visits</h2>
        <p className="text-muted-foreground">Your scheduled and completed field visits</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visits</CardTitle>
          <CardDescription>Scheduled visits and notes</CardDescription>
        </CardHeader>
        <CardContent>
          {(authLoading || loading) ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No visits assigned</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Youth</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications
                  .flatMap((v) =>
                    (v.fieldVisits || []).map((visit) => ({ visit, youth: v.user }))
                  )
                  .map(({ visit, youth }) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        {youth?.firstName ?? ""} {youth?.lastName ?? ""}
                      </TableCell>
                      <TableCell>{new Date(visit.visitDate).toLocaleString()}</TableCell>
                      <TableCell>{visit.notes || "-"}</TableCell>
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
