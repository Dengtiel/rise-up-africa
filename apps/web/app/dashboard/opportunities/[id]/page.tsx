"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { opportunityApi, applicationApi, userApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { toast } from "sonner";
import type { Opportunity } from "@/lib/types";
import { IconBriefcase, IconCheck } from "@tabler/icons-react";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadOpportunity();
    }
  }, [params.id]);

  useEffect(() => {
    // If the current user is a youth, fetch their verification status
    const loadVerification = async () => {
      if (user?.role === "YOUTH") {
        try {
          const v = await userApi.getVerification();
          setVerificationStatus(v?.status || null);
        } catch (err) {
          setVerificationStatus(null);
        }
      } else {
        setVerificationStatus(null);
      }
    };

    loadVerification();
  }, [user]);

  const loadOpportunity = async () => {
    try {
      const data = await opportunityApi.getOpportunity(params.id as string);
      setOpportunity(data);
    } catch (error) {
      toast.error("Failed to load opportunity");
      router.push("/dashboard/opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!opportunity) return;

    setApplying(true);
    try {
      await applicationApi.createApplication({
        opportunityId: opportunity.id,
        coverLetter,
      });
      toast.success("Application submitted successfully!");
      setShowApplyDialog(false);
      setCoverLetter("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setApplying(false);
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

  if (!opportunity) {
    return null;
  }

  const canApply =
    user?.role === "YOUTH" &&
    verificationStatus === "VERIFIED" &&
    opportunity.isActive;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{opportunity.title}</h2>
        <p className="text-muted-foreground">
          Posted by {opportunity.donor?.organizationName || opportunity.donor?.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Details</CardTitle>
              <CardDescription>Opportunity information</CardDescription>
            </div>
            {user?.role === "YOUTH" && opportunity.isActive && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                  <DialogTrigger asChild>
                    <Button disabled={verificationStatus !== "VERIFIED"}>
                      <IconCheck className="mr-2 h-4 w-4" />
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to Opportunity</DialogTitle>
                      <DialogDescription>
                        Submit your application for this opportunity
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Tell us why you're interested in this opportunity..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={6}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowApplyDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleApply} disabled={applying}>
                        {applying ? "Submitting..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {opportunity.applicationLink && (
                  <Button asChild variant="outline" className="mt-2 sm:mt-0">
                    <a href={opportunity.applicationLink} target="_blank" rel="noopener noreferrer">
                      Apply Externally
                    </a>
                  </Button>
                )}

                {verificationStatus !== "VERIFIED" && (
                  <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
                    You must be verified to apply. <a className="underline" href="/dashboard/documents">Upload verification documents</a>.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </div>

          {opportunity.requirements && (
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {opportunity.requirements}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {opportunity.category.map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Countries</h3>
              <p className="text-muted-foreground">
                {opportunity.countries.join(", ")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Deadline</h3>
              <p className="text-muted-foreground">
                {opportunity.deadline
                  ? new Date(opportunity.deadline).toLocaleDateString()
                  : "No deadline"}
              </p>
            </div>
            {opportunity.maxApplicants && (
              <div>
                <h3 className="font-semibold mb-2">Max Applicants</h3>
                <p className="text-muted-foreground">
                  {opportunity.maxApplicants}
                </p>
              </div>
            )}
            {opportunity._count && (
              <div>
                <h3 className="font-semibold mb-2">Current Applications</h3>
                <p className="text-muted-foreground">
                  {opportunity._count.applications}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

