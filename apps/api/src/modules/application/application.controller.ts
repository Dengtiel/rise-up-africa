import { type Response } from "express";
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from "./application.schema";
import {
  createApplication,
  createApplicationWithDocuments,
  getYouthApplications,
  getOpportunityApplications,
  updateApplicationStatus,
  getApplicationById,
} from "./application.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const createApplicationHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const validatedData = createApplicationSchema.parse(req.body);
    // If documents were provided, use the helper that also creates Document records.
    const application = Array.isArray(validatedData.documents) && validatedData.documents.length > 0
      ? await createApplicationWithDocuments(req.userId, validatedData as any)
      : await createApplication(req.userId, validatedData as any);

    res.status(201).json(application);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getYouthApplicationsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const applications = await getYouthApplications(req.userId);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOpportunityApplicationsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { opportunityId } = req.params;
    if (!opportunityId) {
      res.status(400).json({ error: "Missing opportunityId" });
      return;
    }
    const applications = await getOpportunityApplications(opportunityId, req.userId);
    res.status(200).json(applications);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const updateApplicationStatusHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { applicationId } = req.params;
    if (!applicationId) {
      res.status(400).json({ error: "Missing applicationId" });
      return;
    }
    const validatedData = updateApplicationStatusSchema.parse(req.body);
    const application = await updateApplicationStatus(
      applicationId,
      req.userId,
      validatedData
    );
    res.status(200).json(application);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getApplicationByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { applicationId } = req.params;
    if (!applicationId) {
      res.status(400).json({ error: "Missing applicationId" });
      return;
    }
    const application = await getApplicationById(applicationId, req.userId);
    res.status(200).json(application);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

