"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { opportunityApi, applicationApi } from "@/lib/api";
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
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOpportunity();
    }
  }, [params.id]);

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
      // Read files as data URLs and include them as document objects in the application
      const readFileAsDataUrl = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const docs: Array<any> = [];
      if (cvFile) {
        const url = await readFileAsDataUrl(cvFile);
        docs.push({ fileName: cvFile.name, fileUrl: url, mimeType: cvFile.type, size: cvFile.size, type: "CV" });
      }
      for (const f of attachments) {
        const url = await readFileAsDataUrl(f);
        docs.push({ fileName: f.name, fileUrl: url, mimeType: f.type, size: f.size, type: "ATTACHMENT" });
      }

      await applicationApi.createApplication({
        opportunityId: opportunity.id,
        coverLetter,
        documents: docs.length > 0 ? docs : undefined,
      });
      toast.success("Application submitted successfully!");
      setShowApplyDialog(false);
      setCoverLetter("");
      setCvFile(null);
      setAttachments([]);
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

  const canApply = user?.role === "YOUTH" && opportunity.isActive;

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
            {canApply && (
              opportunity.applicationLink ? (
                <a href={opportunity.applicationLink} target="_blank" rel="noopener noreferrer">
                  <Button>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Apply via External Link
                  </Button>
                </a>
              ) : (
                <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                  <DialogTrigger asChild>
                    <Button>
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
                      <div className="space-y-2">
                        <Label htmlFor="cv">Attach CV (Optional)</Label>
                        <input
                          id="cv"
                          type="file"
                          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="attachments">Additional Documents (Optional)</Label>
                        <input
                          id="attachments"
                          type="file"
                          multiple
                          onChange={(e) => setAttachments(Array.from(e.target.files || []))}
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
              )
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

