import { type Response } from "express";
import {
  createOpportunitySchema,
  updateOpportunitySchema,
} from "./opportunity.schema";
import {
  createOpportunity,
  updateOpportunity,
  getOpportunities,
  getOpportunityById,
  deleteOpportunity,
} from "./opportunity.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const createOpportunityHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const validatedData = createOpportunitySchema.parse(req.body);
    const opportunity = await createOpportunity(req.userId, validatedData);
    res.status(201).json(opportunity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const updateOpportunityHandler = async (
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
      res.status(400).json({ error: "Opportunity ID is required" });
      return;
    }
    const validatedData = updateOpportunitySchema.parse(req.body);
    const opportunity = await updateOpportunity(
      opportunityId,
      req.userId,
      validatedData
    );
    res.status(200).json(opportunity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getOpportunitiesHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, country, isActive, donorId } = req.query;
    const filters = {
      category: category as string | undefined,
      country: country as string | undefined,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      donorId: donorId as string | undefined,
    };

    const opportunities = await getOpportunities(filters);
    res.status(200).json(opportunities);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOpportunityByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { opportunityId } = req.params;
    if (!opportunityId) {
      res.status(400).json({ error: "Opportunity ID is required" });
      return;
    }
    const opportunity = await getOpportunityById(opportunityId);
    res.status(200).json(opportunity);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const deleteOpportunityHandler = async (
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
      res.status(400).json({ error: "Opportunity ID is required" });
      return;
    }
    const result = await deleteOpportunity(opportunityId, req.userId);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

