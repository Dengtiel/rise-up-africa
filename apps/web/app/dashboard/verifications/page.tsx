"use client";

import { useState, useEffect } from "react";
import { verificationApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import { userApi } from "@/lib/api";
import type { Verification } from "@/lib/types";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard-header";
import { IconClipboardCheck } from "@tabler/icons-react";

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [selectedForSchedule, setSelectedForSchedule] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<"VERIFIED" | "REJECTED" | "UNDER_REVIEW">("VERIFIED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const data = await verificationApi.getPendingVerifications();
      setVerifications(data);
    } catch (error) {
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  

  const handleReview = async () => {
    if (!selectedVerification) return;

    setReviewing(true);
    try {
      await verificationApi.reviewVerification(selectedVerification.id, {
        status: reviewStatus,
        notes: reviewNotes || undefined,
      });
      toast.success("Verification reviewed successfully!");
      setShowReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes("");
      loadVerifications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review verification");
    } finally {
      setReviewing(false);
    }
  };

  const openReviewDialog = (verification: any) => {
    setSelectedVerification(verification);
    setReviewStatus("VERIFIED");
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const openScheduleDialog = (verification: any) => {
    setSelectedForSchedule(verification);
    setScheduleDate("");
    setScheduleNotes("");
    setScheduleError(null);
    setShowScheduleDialog(true);
  };

  const openAssignDialog = async (verification: any) => {
    setSelectedForSchedule(verification);
    setAssignError(null);
    setSelectedAgentId(null);
    setShowAssignDialog(true);
    setLoadingAgents(true);
    try {
      // fetch field agents (get many, then filter client-side for camp/country)
      const res = await userApi.getUsers({ role: "FIELD_AGENT", limit: 1000 });
      const items = res.items || [];
      // Prefer agents in same camp or community first, then same country
      const camp = verification.user?.camp;
      const community = verification.user?.community;
      const country = verification.user?.country;

      const matched: any[] = [];
      const countryMatched: any[] = [];

      items.forEach((a: any) => {
        if (camp && a.camp === camp) matched.push(a);
        else if (community && a.camp === community) matched.push(a);
        else if (country && a.country === country) countryMatched.push(a);
      });

      const ordered = [...matched, ...countryMatched];
      setAgents(ordered);
    } catch (err) {
      setAssignError("Failed to load field agents");
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedForSchedule) return;
    if (!scheduleDate) {
      toast.error("Please select a visit date and time");
      return;
    }

    setScheduling(true);
    try {
      // Convert local datetime-local input to ISO
      const iso = new Date(scheduleDate).toISOString();
      await verificationApi.scheduleVisit({
        verificationId: selectedForSchedule.id,
        visitDate: iso,
        notes: scheduleNotes || undefined,
      });
      toast.success("Field visit scheduled successfully");
      setShowScheduleDialog(false);
      setSelectedForSchedule(null);
      loadVerifications();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to schedule visit";
      // Provide admin-facing actionable message for missing agents
      if (msg.includes("No field agents available in the youth's camp or country")) {
        const friendly = "No agents found in the youth's camp or country. Assign a field agent manually to proceed.";
        setScheduleError(friendly);
        toast.error(friendly);
      } else {
        setScheduleError(msg);
        toast.error(msg);
      }
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Pending Verifications" subtitle="Review and approve youth verifications" />

      <Card>
        <CardHeader>
          <CardTitle>Verifications</CardTitle>
          <CardDescription>Youth awaiting verification</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending verifications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Youth</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {verification.user?.firstName} {verification.user?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {verification.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {verification.user?.category || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {verification.user?.country || "N/A"}
                        {verification.user?.camp && (
                          <div className="text-muted-foreground">
                            {verification.user.camp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {verification.user?.documents?.length || 0} documents
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(verification)}
                      >
                        Review
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openScheduleDialog(verification)}
                        className="ml-2"
                      >
                        Schedule Visit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openAssignDialog(verification)}
                        className="ml-2"
                      >
                        Assign Agent
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Verification</DialogTitle>
            <DialogDescription>
              Review and approve or reject this verification
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={reviewStatus}
                  onValueChange={(value) =>
                    setReviewStatus(value as typeof reviewStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={reviewing}>
              {reviewing ? "Processing..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Field Visit</DialogTitle>
              <DialogDescription>
                Schedule a field visit and auto-assign a field agent based on location
              </DialogDescription>
            </DialogHeader>
            {selectedForSchedule && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="visitDate">Visit Date & Time</Label>
                  <input
                    id="visitDate"
                    className="w-full rounded-md border p-2"
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleNotes">Notes</Label>
                  <Textarea
                    id="scheduleNotes"
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    placeholder="Optional notes for the field agent"
                    rows={4}
                  />
                </div>
                {scheduleError && (
                  <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm">
                    <div className="font-medium text-yellow-800">Unable to schedule visit</div>
                    <div className="text-yellow-700 mt-1">{scheduleError}</div>
                    <div className="mt-2">
                      <Link href="/dashboard/users?role=FIELD_AGENT" className="text-sm text-blue-600 underline">Assign a Field Agent</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSchedule} disabled={scheduling}>
                {scheduling ? "Scheduling..." : "Schedule Visit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Field Agent</DialogTitle>
              <DialogDescription>
                Assign a field agent to this verification (prefers same camp/community then country)
              </DialogDescription>
            </DialogHeader>
            {selectedForSchedule && (
              <div className="space-y-4 py-4">
                <div>
                  <div className="text-sm">Youth: {selectedForSchedule.user?.firstName} {selectedForSchedule.user?.lastName}</div>
                  <div className="text-sm text-muted-foreground">Location: {selectedForSchedule.user?.camp || selectedForSchedule.user?.community || selectedForSchedule.user?.country}</div>
                </div>

                <div className="space-y-2">
                  {loadingAgents ? (
                    <div className="text-sm text-muted-foreground">Loading agents...</div>
                  ) : agents.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No matching agents found. Try scheduling after adding agents.</div>
                  ) : (
                    <select
                      value={selectedAgentId || ""}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Select an agent</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.firstName} {a.lastName} — {a.camp || a.country}
                        </option>
                      ))}
                    </select>
                  )}
                  {assignError && <div className="text-sm text-red-600">{assignError}</div>}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!selectedForSchedule || !selectedAgentId) {
                    setAssignError("Please select an agent to assign");
                    return;
                  }
                  setAssigning(true);
                  setAssignError(null);
                  try {
                    await verificationApi.assignFieldAgent(selectedForSchedule.id, selectedAgentId);
                    toast.success("Field agent assigned successfully");
                    setShowAssignDialog(false);
                    setSelectedForSchedule(null);
                    loadVerifications();
                  } catch (err) {
                    setAssignError(err instanceof Error ? err.message : "Failed to assign agent");
                  } finally {
                    setAssigning(false);
                  }
                }}
                disabled={assigning}
              >
                {assigning ? "Assigning..." : "Assign Agent"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </div>
  );
}

