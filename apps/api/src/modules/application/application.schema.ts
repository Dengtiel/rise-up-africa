import { z } from "zod";

export const createApplicationSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  coverLetter: z.string().optional(),
  additionalInfo: z.string().optional(),
  documents: z
    .array(
      z.object({
        fileName: z.string().min(1),
        fileUrl: z.string().min(1),
        mimeType: z.string().optional(),
        size: z.number().int().positive().optional(),
        type: z.string().optional(),
      })
    )
    .optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "SELECTED", "REJECTED"]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

