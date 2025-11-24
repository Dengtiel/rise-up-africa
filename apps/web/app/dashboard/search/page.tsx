"use client";

import { useState, useEffect } from "react";
import { verificationApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import type { User } from "@/lib/types";
import { IconSearch } from "@tabler/icons-react";

export default function SearchPage() {
  const [youth, setYouth] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    country: "",
    camp: "",
    status: "all",
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchFilters = {
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.country && { country: filters.country }),
        ...(filters.camp && { camp: filters.camp }),
        ...(filters.status !== "all" && { status: filters.status }),
      };
      const data = await verificationApi.searchYouth(searchFilters);
      setYouth(data);
    } catch (error) {
      toast.error("Failed to search youth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Search Youth</h2>
        <p className="text-muted-foreground">
          Find verified youth candidates for your opportunities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>Filter youth by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
              <Input
                placeholder="Camp/Community"
                value={filters.camp}
                onChange={(e) =>
                  setFilters({ ...filters, camp: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSearch} className="mt-4" disabled={loading}>
            <IconSearch className="mr-2 h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {youth.length} youth found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : youth.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <IconSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No youth found matching your criteria</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {youth.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {person.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{person.category || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {person.country || "N/A"}
                        {person.camp && (
                          <div className="text-muted-foreground">
                            {person.camp}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {person.verification?.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {person.documents?.length || 0} documents
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

