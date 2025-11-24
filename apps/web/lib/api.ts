import type { User, Document, Verification, Opportunity, Application } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ApiError {
  error: string;
  details?: unknown;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "An error occurred",
      }));
      throw new Error(error.error || "An error occurred");
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: "YOUTH" | "DONOR" | "ADMIN" | "FIELD_AGENT" | "SUPER_ADMIN";
    category?: "REFUGEE" | "IDP" | "VULNERABLE" | "PWD";
    country?: string;
    camp?: string;
    community?: string;
    dateOfBirth?: string;
    gender?: string;
    organizationName?: string;
    organizationType?: string;
  }) => api.post<{ user: unknown; token: string }>("/api/auth/register", data),

  login: (email: string, password: string) =>
    api.post<{ user: unknown; token: string }>("/api/auth/login", {
      email,
      password,
    }),
};

// User API
export const userApi = {
  getProfile: () => api.get<User>("/api/user/profile"),
  updateProfile: (data: unknown) => api.put<User>("/api/user/profile", data),
  getDocuments: () => api.get<Document[]>("/api/user/documents"),
  getVerification: () => api.get<Verification>("/api/user/verification"),
};

// Verification API
export const verificationApi = {
  uploadDocument: (data: {
    type: "ID" | "TRANSCRIPT" | "RECOMMENDATION_LETTER";
    fileName: string;
    fileUrl: string;
    mimeType?: string;
    size?: number;
  }) => api.post<{ document: Document; action: "created" | "replaced" }>("/api/verification/documents", data),
  getPendingVerifications: () => api.get<Verification[]>("/api/verification/pending"),
  reviewVerification: (verificationId: string, data: {
    status: "VERIFIED" | "REJECTED" | "UNDER_REVIEW";
    notes?: string;
  }) => api.put<Verification>(`/api/verification/${verificationId}/review`, data),
  assignFieldAgent: (verificationId: string, fieldAgentId: string) =>
    api.put<Verification>(`/api/verification/${verificationId}/assign`, { fieldAgentId }),
  getFieldAgentVerifications: () => api.get<Verification[]>("/api/verification/field-agent"),
  createFieldVisit: (data: {
    verificationId: string;
    visitDate: string;
    notes?: string;
    photos?: string[];
  }) => api.post<any>("/api/verification/field-visit", data),
  scheduleVisit: (data: {
    verificationId: string;
    visitDate: string;
    notes?: string;
    preferredAgentId?: string;
  }) => api.post<any>("/api/verification/schedule", data),
  completeVerification: (verificationId: string, notes?: string) =>
    api.put<Verification>(`/api/verification/${verificationId}/complete`, { notes }),
  searchYouth: (filters: {
    category?: string;
    country?: string;
    camp?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.country) params.append("country", filters.country);
    if (filters.camp) params.append("camp", filters.camp);
    if (filters.status) params.append("status", filters.status);
    return api.get<User[]>(`/api/verification/search?${params.toString()}`);
  },
};

// Users API
export const usersApi = {
  listUsers: (role?: string) => api.get<any[]>(`/api/users${role ? `?role=${encodeURIComponent(role)}` : ""}`),
};

// Opportunity API
export const opportunityApi = {
  getOpportunities: (filters?: {
    category?: string;
    country?: string;
    isActive?: boolean;
    donorId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.country) params.append("country", filters.country);
    if (filters?.isActive !== undefined)
      params.append("isActive", String(filters.isActive));
    if (filters?.donorId) params.append("donorId", filters.donorId);
    return api.get<Opportunity[]>(`/api/opportunities?${params.toString()}`);
  },
  getOpportunity: (id: string) => api.get<Opportunity>(`/api/opportunities/${id}`),
  createOpportunity: (data: {
    title: string;
    description: string;
    requirements?: string;
    applicationLink?: string;
    category: ("REFUGEE" | "IDP" | "VULNERABLE" | "PWD")[];
    countries: string[];
    deadline?: string;
    maxApplicants?: number;
  }) => api.post<Opportunity>("/api/opportunities", data),
  updateOpportunity: (id: string, data: unknown) =>
    api.put<Opportunity>(`/api/opportunities/${id}`, data),
  deleteOpportunity: (id: string) => api.delete<{ message: string }>(`/api/opportunities/${id}`),
};

// Application API
export const applicationApi = {
  createApplication: (data: {
    opportunityId: string;
    coverLetter?: string;
    additionalInfo?: string;
  }) => api.post<Application>("/api/applications", data),
  getMyApplications: () => api.get<Application[]>("/api/applications/my-applications"),
  getOpportunityApplications: (opportunityId: string) =>
    api.get<Application[]>(`/api/applications/opportunity/${opportunityId}`),
  updateApplicationStatus: (applicationId: string, status: "PENDING" | "UNDER_REVIEW" | "SELECTED" | "REJECTED") =>
    api.put<Application>(`/api/applications/${applicationId}/status`, { status }),
  getApplication: (applicationId: string) =>
    api.get<Application>(`/api/applications/${applicationId}`),
};

