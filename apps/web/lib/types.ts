export type UserRole = "YOUTH" | "DONOR" | "ADMIN" | "FIELD_AGENT" | "SUPER_ADMIN";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "UNDER_REVIEW";
export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "SELECTED" | "REJECTED";
export type YouthCategory = "REFUGEE" | "IDP" | "VULNERABLE" | "PWD";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  category?: YouthCategory;
  country?: string;
  camp?: string;
  community?: string;
  dateOfBirth?: string;
  gender?: string;
  organizationName?: string;
  organizationType?: string;
  createdAt: string;
  updatedAt?: string;
  // Optional nested properties from API responses
  documents?: Document[];
  verification?: Verification;
}

export interface Document {
  id: string;
  userId: string;
  type: "ID" | "TRANSCRIPT" | "RECOMMENDATION_LETTER";
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  size?: number;
  uploadedAt: string;
}

export interface Verification {
  id: string;
  userId: string;
  status: VerificationStatus;
  adminId?: string;
  fieldAgentId?: string;
  adminNotes?: string;
  fieldNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  admin?: User;
  fieldAgent?: User;
  fieldVisits?: FieldVisit[];
}

export interface FieldVisit {
  id: string;
  verificationId: string;
  fieldAgentId: string;
  visitDate: string;
  notes?: string;
  photos: string[];
  createdAt: string;
}

export interface Opportunity {
  id: string;
  donorId: string;
  title: string;
  description: string;
  requirements?: string;
  applicationLink?: string;
  category: YouthCategory[];
  countries: string[];
  deadline?: string;
  maxApplicants?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  donor?: User;
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  youthId: string;
  opportunityId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  additionalInfo?: string;
  submittedAt: string;
  updatedAt: string;
  youth?: User;
  opportunity?: Opportunity;
}

