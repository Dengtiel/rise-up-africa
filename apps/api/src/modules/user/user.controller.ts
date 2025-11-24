import { type Response } from "express";
import { updateProfileSchema } from "./user.schema";
import { getUserProfile, updateUserProfile, getUserDocuments, getUserVerification } from "./user.service";
import { listUsers } from "./user.service";
import type { AuthRequest } from "../../middleware/auth.middleware";

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const profile = await getUserProfile(req.userId);
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const profile = await updateUserProfile(req.userId, validatedData);
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const documents = await getUserDocuments(req.userId);
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const verification = await getUserVerification(req.userId);
    res.status(200).json(verification);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listUsersHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query;
    const users = await listUsers({ role: role as string | undefined });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

