"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { opportunityApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { toast } from "sonner";
import { IconBriefcase } from "@tabler/icons-react";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    category: [] as string[],
    countries: [] as string[],
    applicationLink: "",
    deadline: "",
    maxApplicants: "",
  });
  const [countryInput, setCountryInput] = useState("");

  const categories = ["REFUGEE", "IDP", "VULNERABLE", "PWD"];

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        category: [...formData.category, category],
      });
    } else {
      setFormData({
        ...formData,
        category: formData.category.filter((c) => c !== category),
      });
    }
  };

  const handleAddCountry = () => {
    if (countryInput.trim() && !formData.countries.includes(countryInput.trim())) {
      setFormData({
        ...formData,
        countries: [...formData.countries, countryInput.trim()],
      });
      setCountryInput("");
    }
  };

  const handleRemoveCountry = (country: string) => {
    setFormData({
      ...formData,
      countries: formData.countries.filter((c) => c !== country),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.category.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (formData.countries.length === 0) {
      toast.error("Please add at least one country");
      return;
    }

    setLoading(true);

    try {
      const deadlineIso = formData.deadline ? new Date(formData.deadline).toISOString() : undefined;

      await opportunityApi.createOpportunity({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || undefined,
        applicationLink: formData.applicationLink || undefined,
        category: formData.category as any,
        countries: formData.countries,
        deadline: deadlineIso,
        maxApplicants: formData.maxApplicants
          ? parseInt(formData.maxApplicants)
          : undefined,
      });
      toast.success("Opportunity created successfully!");
      router.push("/dashboard/opportunities");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create opportunity");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-3xl font-bold tracking-tight">Post New Opportunity</h2>
        <p className="text-muted-foreground">
          Create a new opportunity for youth
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>Fill in the information about your opportunity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
                placeholder="e.g., Scholarship Program 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                disabled={loading}
                rows={6}
                placeholder="Describe the opportunity in detail..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                disabled={loading}
                rows={4}
                placeholder="List the requirements..."
              />
            </div>

            <div className="space-y-2">
              <Label>Categories *</Label>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat}
                      checked={formData.category.includes(cat)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(cat, checked as boolean)
                      }
                      disabled={loading}
                    />
                    <Label htmlFor={cat} className="font-normal">
                      {cat}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Countries *</Label>
              <div className="flex gap-2">
                <Input
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCountry();
                    }
                  }}
                  placeholder="Add country"
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={handleAddCountry}
                  disabled={loading}
                >
                  Add
                </Button>
              </div>
              {formData.countries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.countries.map((country) => (
                    <div
                      key={country}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md"
                    >
                      <span>{country}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCountry(country)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxApplicants">Max Applicants</Label>
                <Input
                  id="maxApplicants"
                  type="number"
                  value={formData.maxApplicants}
                  onChange={(e) =>
                    setFormData({ ...formData, maxApplicants: e.target.value })
                  }
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationLink">External Application Link (optional)</Label>
              <Input
                id="applicationLink"
                type="url"
                placeholder="https://example.com/apply"
                value={formData.applicationLink}
                onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Opportunity"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

