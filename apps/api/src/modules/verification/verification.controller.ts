import { type Response } from "express";
import {
  uploadDocumentSchema,
  adminReviewSchema,
  fieldVisitSchema,
  assignFieldAgentSchema,
} from "./verification.schema";
import {
  uploadDocument,
  getPendingVerifications,
  adminReviewVerification,
  assignFieldAgent,
  getFieldAgentVerifications,
  scheduleFieldVisit,
  createFieldVisit,
  completeFieldVerification,
  searchYouth,
} from "./verification.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const uploadDocumentHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Normalize incoming `size` value which may be sent as a string
    // (e.g. multipart/form-data sends file.size as a string). If the
    // value is missing or not a valid positive number we'll omit it
    // so the schema's `optional()` behavior applies.
    const raw = req.body || {};
    const parsedSize = raw.size !== undefined ? Number(raw.size) : undefined;
    const normalized = {
      ...raw,
      size:
        typeof parsedSize === "number" && !Number.isNaN(parsedSize)
          ? parsedSize
          : undefined,
    };

    const validatedData = uploadDocumentSchema.parse(normalized);
    const result = await uploadDocument(req.userId, validatedData);
    // `result` has shape { document, action }
    if (result.action === "created") {
      res.status(201).json({ document: result.document, action: result.action });
    } else {
      res.status(200).json({ document: result.document, action: result.action });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getPendingVerificationsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const verifications = await getPendingVerifications();
    res.status(200).json(verifications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const adminReviewHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { verificationId } = req.params;
    const validatedData = adminReviewSchema.parse(req.body);
    const verification = await adminReviewVerification(
      verificationId,
      req.userId,
      validatedData
    );
    res.status(200).json(verification);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const assignFieldAgentHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { verificationId } = req.params;
    const validatedData = assignFieldAgentSchema.parse(req.body);
    const verification = await assignFieldAgent(verificationId, validatedData);
    res.status(200).json(verification);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getFieldAgentVerificationsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const verifications = await getFieldAgentVerifications(req.userId);
    res.status(200).json(verifications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createFieldVisitHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const validatedData = fieldVisitSchema.parse(req.body);
    const visit = await createFieldVisit(req.userId, validatedData);
    res.status(201).json(visit);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const scheduleFieldVisitHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const validatedData = fieldVisitSchema.parse(req.body);
    // Only ADMIN can call this handler; route-level authorize middleware ensures that
    const result = await scheduleFieldVisit(req.userId, validatedData);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const completeFieldVerificationHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { verificationId } = req.params;
    const { notes } = req.body;
    const verification = await completeFieldVerification(
      verificationId,
      req.userId,
      notes
    );
    res.status(200).json(verification);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const searchYouthHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, country, camp, status } = req.query;
    const filters = {
      category: category as string | undefined,
      country: country as string | undefined,
      camp: camp as string | undefined,
      status: status as string | undefined,
    };

    const results = await searchYouth(filters);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

