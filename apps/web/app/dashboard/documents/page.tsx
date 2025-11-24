"use client";

import { useState, useEffect } from "react";
import { userApi, verificationApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { toast } from "sonner";
import type { Document } from "@/lib/types";
import { IconFileUpload, IconTrash } from "@tabler/icons-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    type: "ID" as "ID" | "TRANSCRIPT" | "RECOMMENDATION_LETTER",
    fileName: "",
    fileUrl: "",
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await userApi.getDocuments();
      setDocuments(docs);
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to cloud storage (S3, etc.) and get the URL
      // For now, we'll use a placeholder
      const fileUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        fileName: file.name,
        fileUrl: fileUrl, // In production, this would be the cloud storage URL
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // In production, upload file first, then save document record
      const res = await verificationApi.uploadDocument({
        ...formData,
        mimeType: "application/pdf",
        size: 0,
      });

      if (res.action === "replaced") {
        toast.success("Existing document replaced successfully");
      } else {
        toast.success("Document uploaded successfully!");
      }
      setFormData({ type: "ID", fileName: "", fileUrl: "" });
      loadDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "ID":
        return "National ID";
      case "TRANSCRIPT":
        return "Transcript";
      case "RECOMMENDATION_LETTER":
        return "Recommendation Letter";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">
          Upload your identification and academic documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload your ID, transcript, or recommendation letter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as typeof formData.type })
                }
                disabled={uploading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ID">National ID</SelectItem>
                  <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
                  <SelectItem value="RECOMMENDATION_LETTER">
                    Recommendation Letter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={uploading}
                required
              />
            </div>

            {formData.fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconFileUpload className="h-4 w-4" />
                <span>{formData.fileName}</span>
              </div>
            )}

            <Button type="submit" disabled={uploading || !formData.fileName}>
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>Your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge variant="outline">{getDocumentTypeLabel(doc.type)}</Badge>
                    </TableCell>
                    <TableCell>{doc.fileName}</TableCell>
                    <TableCell>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl, "_blank")}
                      >
                        View
                      </Button>
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

