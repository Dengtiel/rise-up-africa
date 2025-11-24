import { z } from "zod";

export const uploadDocumentSchema = z.object({
  type: z.enum(["ID", "TRANSCRIPT", "RECOMMENDATION_LETTER"]),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Valid file URL is required"),
  mimeType: z.string().optional(),
  // allow 0 sizes (some uploads may report 0) and non-integer sizes
  size: z.number().nonnegative().optional(),
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

export const assignFieldAgentSchema = z.object({
  fieldAgentId: z.string().min(1, "Field agent ID is required"),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type FieldVisitInput = z.infer<typeof fieldVisitSchema>;
export type AssignFieldAgentInput = z.infer<typeof assignFieldAgentSchema>;

export const scheduleVisitSchema = z.object({
  verificationId: z.string().min(1),
  visitDate: z.string().datetime(),
  notes: z.string().optional(),
  preferredAgentId: z.string().optional(),
});

export type ScheduleVisitInput = z.infer<typeof scheduleVisitSchema>;

