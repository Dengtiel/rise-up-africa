import { z } from "zod";

export const createOpportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().optional(),
  applicationLink: z.string().url().optional(),
  category: z.array(z.enum(["REFUGEE", "IDP", "VULNERABLE", "PWD"])).min(1),
  countries: z.array(z.string()).min(1, "At least one country is required"),
  deadline: z.string().datetime().optional(),
  maxApplicants: z.number().int().positive().optional(),
});

export const updateOpportunitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  applicationLink: z.string().url().optional(),
  category: z.array(z.enum(["REFUGEE", "IDP", "VULNERABLE", "PWD"])).optional(),
  countries: z.array(z.string()).optional(),
  deadline: z.string().datetime().optional(),
  maxApplicants: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;

