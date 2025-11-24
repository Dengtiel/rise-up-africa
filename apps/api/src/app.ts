import express, { type Express } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";
import { authenticate, authorize } from "./middleware/auth.middleware";

// Auth routes
import { register, login } from "./modules/auth/auth.controller";

// User routes
import {
  getProfile,
  updateProfile,
  getDocuments,
  getVerification,
  listUsersHandler,
} from "./modules/user/user.controller";

// Verification routes
import {
  uploadDocumentHandler,
  getPendingVerificationsHandler,
  adminReviewHandler,
  assignFieldAgentHandler,
  getFieldAgentVerificationsHandler,
  createFieldVisitHandler,
  completeFieldVerificationHandler,
  searchYouthHandler,
  scheduleVisitHandler,
} from "./modules/verification/verification.controller";

// Opportunity routes
import {
  createOpportunityHandler,
  updateOpportunityHandler,
  getOpportunitiesHandler,
  getOpportunityByIdHandler,
  deleteOpportunityHandler,
} from "./modules/opportunity/opportunity.controller";

// Application routes
import {
  createApplicationHandler,
  getYouthApplicationsHandler,
  getOpportunityApplicationsHandler,
  updateApplicationStatusHandler,
  getApplicationByIdHandler,
} from "./modules/application/application.controller";

const app: Express = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth routes (public)
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// User routes (authenticated)
app.get("/api/user/profile", authenticate, getProfile);
app.put("/api/user/profile", authenticate, updateProfile);
app.get("/api/user/documents", authenticate, getDocuments);
app.get("/api/user/verification", authenticate, getVerification);
// Admin: list users (filter by role)
app.get(
  "/api/users",
  authenticate,
  authorize("ADMIN"),
  listUsersHandler
);

// Document upload (authenticated - youth only)
app.post(
  "/api/verification/documents",
  authenticate,
  authorize("YOUTH"),
  uploadDocumentHandler
);

// Verification routes (admin)
app.get(
  "/api/verification/pending",
  authenticate,
  authorize("ADMIN"),
  getPendingVerificationsHandler
);
app.put(
  "/api/verification/:verificationId/review",
  authenticate,
  authorize("ADMIN"),
  adminReviewHandler
);
app.put(
  "/api/verification/:verificationId/assign",
  authenticate,
  authorize("ADMIN"),
  assignFieldAgentHandler
);

app.post(
  "/api/verification/schedule",
  authenticate,
  authorize("ADMIN"),
  scheduleVisitHandler
);

// Field agent routes
app.get(
  "/api/verification/field-agent",
  authenticate,
  authorize("FIELD_AGENT"),
  getFieldAgentVerificationsHandler
);
app.post(
  "/api/verification/field-visit",
  authenticate,
  authorize("FIELD_AGENT"),
  createFieldVisitHandler
);
app.put(
  "/api/verification/:verificationId/complete",
  authenticate,
  authorize("FIELD_AGENT"),
  completeFieldVerificationHandler
);

// Search youth (donor/admin)
app.get(
  "/api/verification/search",
  authenticate,
  authorize("DONOR", "ADMIN"),
  searchYouthHandler
);

// Opportunity routes
app.get("/api/opportunities", getOpportunitiesHandler); // Public listing
app.get("/api/opportunities/:opportunityId", getOpportunityByIdHandler); // Public details
app.post(
  "/api/opportunities",
  authenticate,
  authorize("DONOR"),
  createOpportunityHandler
);
app.put(
  "/api/opportunities/:opportunityId",
  authenticate,
  authorize("DONOR"),
  updateOpportunityHandler
);
app.delete(
  "/api/opportunities/:opportunityId",
  authenticate,
  authorize("DONOR"),
  deleteOpportunityHandler
);

// Application routes
app.post(
  "/api/applications",
  authenticate,
  authorize("YOUTH"),
  createApplicationHandler
);
app.get(
  "/api/applications/my-applications",
  authenticate,
  authorize("YOUTH"),
  getYouthApplicationsHandler
);
app.get(
  "/api/applications/opportunity/:opportunityId",
  authenticate,
  authorize("DONOR"),
  getOpportunityApplicationsHandler
);
app.put(
  "/api/applications/:applicationId/status",
  authenticate,
  authorize("DONOR"),
  updateApplicationStatusHandler
);
app.get(
  "/api/applications/:applicationId",
  authenticate,
  getApplicationByIdHandler
);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
