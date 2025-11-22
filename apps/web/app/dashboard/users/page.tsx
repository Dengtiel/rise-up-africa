"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { verificationApi, userApi } from "@/lib/api";
import DashboardHeader from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { toast } from "sonner";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers({ page, limit });
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load users - error:", err);
      const message = err instanceof Error ? err.message : "Failed to load users";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Users" subtitle="List of users (use Search for filters)" />

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Registered youth users</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Total: {total}</div>
              <div className="space-x-2">
                <button
                  className="btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span className="text-sm">Page {page}</span>
                <button
                  className="btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                >
                  Next
                </button>
              </div>
            </div>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge variant="outline">{u.category || "N/A"}</Badge></TableCell>
                    <TableCell>{u.country || "N/A"}</TableCell>
                    <TableCell><Badge variant="outline">{u.verification?.status || "N/A"}</Badge></TableCell>
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
