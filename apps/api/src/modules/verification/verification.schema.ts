import { z } from "zod";

// Maximum allowed upload size in bytes (5 MB)
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;

export const uploadDocumentSchema = z.object({
  type: z.enum(["ID", "TRANSCRIPT", "RECOMMENDATION_LETTER"]),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Valid file URL is required"),
  mimeType: z.string().optional(),
  // size must be a positive integer and not exceed MAX_DOCUMENT_SIZE
  size: z.number().int().positive().max(MAX_DOCUMENT_SIZE).optional(),
});

export const adminReviewSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED", "UNDER_REVIEW"]),
  notes: z.string().optional(),
});

export const fieldVisitSchema = z.object({
  verificationId: z.string().min(1),
  visitDate: z.string().datetime(),
  notes: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
});

// Admin scheduling doesn't require a fieldAgentId; the server will
// pick an appropriate field agent based on location.
export const scheduleVisitSchema = fieldVisitSchema;

export const assignFieldAgentSchema = z.object({
  fieldAgentId: z.string().min(1, "Field agent ID is required"),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type FieldVisitInput = z.infer<typeof fieldVisitSchema>;
export type AssignFieldAgentInput = z.infer<typeof assignFieldAgentSchema>;
export type ScheduleVisitInput = z.infer<typeof scheduleVisitSchema>;

