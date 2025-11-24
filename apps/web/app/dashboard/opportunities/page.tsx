"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { opportunityApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { toast } from "sonner";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { IconBriefcase, IconSearch } from "@tabler/icons-react";

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "all",
    country: "",
    isActive: "true",
  });

  useEffect(() => {
    loadOpportunities();
  }, [filters]);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const data = await opportunityApi.getOpportunities({
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.country && { country: filters.country }),
        ...(filters.isActive !== "all" && { isActive: filters.isActive === "true" }),
        ...(user?.role === "DONOR" && { donorId: user.id }),
      });
      setOpportunities(data);
    } catch (error) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {user?.role === "DONOR" ? "My Opportunities" : "Opportunities"}
          </h2>
          <p className="text-muted-foreground">
            {user?.role === "DONOR"
              ? "Manage your posted opportunities"
              : "Browse available opportunities"}
          </p>
        </div>
        {user?.role === "DONOR" && (
          <Button asChild>
            <Link href="/dashboard/opportunities/new">Post Opportunity</Link>
          </Button>
        )}
      </div>

      {user?.role !== "DONOR" && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="REFUGEE">Refugee</SelectItem>
                    <SelectItem value="IDP">IDP</SelectItem>
                    <SelectItem value="VULNERABLE">Vulnerable</SelectItem>
                    <SelectItem value="PWD">PWD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Country"
                  value={filters.country}
                  onChange={(e) =>
                    setFilters({ ...filters, country: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Select
                  value={filters.isActive}
                  onValueChange={(value) =>
                    setFilters({ ...filters, isActive: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active Only</SelectItem>
                    <SelectItem value="false">Inactive Only</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <IconBriefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No opportunities found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2">{opp.title}</CardTitle>
                  {!opp.isActive && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {opp.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {opp.category.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Countries: {opp.countries.join(", ")}</p>
                    <p>Deadline: {formatDate(opp.deadline)}</p>
                    {opp._count && (
                      <p>Applications: {opp._count.applications}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/dashboard/opportunities/${opp.id}`}>View</Link>
                  </Button>
                  {user?.role === "DONOR" && (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/dashboard/opportunities/${opp.id}/applications`}>
                        Applications
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

