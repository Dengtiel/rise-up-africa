"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { verificationApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import { IconMapPin } from "@tabler/icons-react";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [visitData, setVisitData] = useState({
    visitDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "FIELD_AGENT") {
      router.push("/dashboard");
      return;
    }

    loadAssignments();
    const id = setInterval(loadAssignments, 15000);
    return () => clearInterval(id);
  }, [authLoading, user]);

  const loadAssignments = async () => {
    try {
      const data = await verificationApi.getFieldAgentVerifications();
      setAssignments(data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async () => {
    if (!selectedAssignment) return;

    setSubmitting(true);
    try {
      const visitDateIso = visitData.visitDate ? new Date(visitData.visitDate).toISOString() : undefined;

      await verificationApi.createFieldVisit({
        verificationId: selectedAssignment.id,
        visitDate: visitDateIso || "",
        notes: visitData.notes || undefined,
      });
      toast.success("Field visit recorded successfully!");
      setShowVisitDialog(false);
      setSelectedAssignment(null);
      setVisitData({ visitDate: "", notes: "" });
      loadAssignments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record visit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteVerification = async (verificationId: string) => {
    try {
      await verificationApi.completeVerification(verificationId);
      toast.success("Verification completed successfully!");
      loadAssignments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete verification");
    }
  };

  const openVisitDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    setVisitData({ visitDate: "", notes: "" });
    setShowVisitDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Assignments</h2>
        <p className="text-muted-foreground">
          Manage your assigned verification cases
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Your assigned verification cases</CardDescription>
        </CardHeader>
        <CardContent>
          {(authLoading || loading) ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconMapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assignments yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Youth</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {assignment.user?.firstName} {assignment.user?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {assignment.user?.country || "N/A"}
                        {assignment.user?.camp && (
                          <div className="text-muted-foreground">
                            {assignment.user.camp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.fieldVisits?.length || 0} visits
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openVisitDialog(assignment)}
                        >
                          Record Visit
                        </Button>
                        {assignment.status === "UNDER_REVIEW" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteVerification(assignment.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Field Visit</DialogTitle>
            <DialogDescription>
              Record details of your field visit
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="visitDate">Visit Date</Label>
              <Input
                id="visitDate"
                type="datetime-local"
                value={visitData.visitDate}
                onChange={(e) =>
                  setVisitData({ ...visitData, visitDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={visitData.notes}
                onChange={(e) =>
                  setVisitData({ ...visitData, notes: e.target.value })
                }
                placeholder="Record your observations..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVisitDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateVisit} disabled={submitting}>
              {submitting ? "Recording..." : "Record Visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

