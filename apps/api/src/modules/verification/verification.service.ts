import prisma from "../../prisma/client";
import type {
  UploadDocumentInput,
  AdminReviewInput,
  FieldVisitInput,
  AssignFieldAgentInput,
  ScheduleVisitInput,
} from "./verification.schema";

export const uploadDocument = async (
  userId: string,
  input: UploadDocumentInput
) => {
  // Check if a document of the same type already exists for this user
  const existing = await prisma.document.findFirst({
    where: { userId, type: input.type },
  });

  if (existing) {
    const document = await prisma.document.update({
      where: { id: existing.id },
      data: {
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        size: input.size,
        uploadedAt: new Date(),
      },
    });
    return { document, action: "replaced" as const };
  }

  const document = await prisma.document.create({
    data: {
      userId,
      ...input,
    },
  });

  return { document, action: "created" as const };
};

export const getPendingVerifications = async () => {
  return await prisma.verification.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          category: true,
          country: true,
          camp: true,
          community: true,
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              fileUrl: true,
              uploadedAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const adminReviewVerification = async (
  verificationId: string,
  adminId: string,
  input: AdminReviewInput
) => {
  const { status, notes } = input;

  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status,
      adminId,
      adminNotes: notes,
      verifiedAt: status === "VERIFIED" ? new Date() : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

export const assignFieldAgent = async (
  verificationId: string,
  input: AssignFieldAgentInput
) => {
  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      fieldAgentId: input.fieldAgentId,
      status: "UNDER_REVIEW",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          country: true,
          camp: true,
          community: true,
        },
      },
      fieldAgent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

export const scheduleVisit = async (
  adminId: string,
  input: ScheduleVisitInput
) => {
  const { verificationId, visitDate, notes, preferredAgentId } = input;

  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { user: true },
  });

  if (!verification) {
    throw new Error("Verification not found");
  }

  // If a preferred agent was provided, try to assign directly
  if (preferredAgentId) {
    const agent = await prisma.user.findUnique({ where: { id: preferredAgentId } });
    if (!agent || agent.role !== "FIELD_AGENT") {
      throw new Error("Preferred field agent not found or not a field agent");
    }

    const visit = await prisma.fieldVisit.create({
      data: {
        verificationId,
        fieldAgentId: preferredAgentId,
        visitDate: new Date(visitDate),
        notes,
      },
      include: {
        verification: { include: { user: true } },
        fieldAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.verification.update({
      where: { id: verificationId },
      data: { fieldAgentId: preferredAgentId, status: "UNDER_REVIEW" },
    });

    return { visit, assignedAgent: visit.fieldAgent };
  }

  // Find nearby field agents: prefer camp/community then country
  const { camp, community, country } = verification.user || {};

  let agents: any[] = [];

  if (camp) {
    agents = await prisma.user.findMany({ where: { role: "FIELD_AGENT", camp } });
  }

  if (agents.length === 0 && community) {
    agents = await prisma.user.findMany({ where: { role: "FIELD_AGENT", community } });
  }

  if (agents.length === 0 && country) {
    agents = await prisma.user.findMany({ where: { role: "FIELD_AGENT", country } });
  }

  if (agents.length === 0) {
    throw new Error(
      "No field agents available in the user's camp, community, or country. Please add agents or assign manually."
    );
  }

  // Pick the first available agent for now
  const assigned = agents[0];

  const visit = await prisma.fieldVisit.create({
    data: {
      verificationId,
      fieldAgentId: assigned.id,
      visitDate: new Date(visitDate),
      notes,
    },
    include: {
      verification: { include: { user: true } },
      fieldAgent: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await prisma.verification.update({
    where: { id: verificationId },
    data: { fieldAgentId: assigned.id, status: "UNDER_REVIEW" },
  });

  return { visit, assignedAgent: visit.fieldAgent };
};

export const getFieldAgentVerifications = async (fieldAgentId: string) => {
  return await prisma.verification.findMany({
    where: { fieldAgentId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          category: true,
          country: true,
          camp: true,
          community: true,
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              fileUrl: true,
            },
          },
        },
      },
      fieldVisits: {
        orderBy: { visitDate: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createFieldVisit = async (fieldAgentId: string, input: FieldVisitInput) => {
  const { verificationId, visitDate, notes, photos } = input;

  return await prisma.fieldVisit.create({
    data: {
      verificationId,
      fieldAgentId,
      visitDate: new Date(visitDate),
      notes,
      photos: photos || [],
    },
    include: {
      verification: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};

export const completeFieldVerification = async (
  verificationId: string,
  fieldAgentId: string,
  notes?: string
) => {
  return await prisma.verification.update({
    where: { id: verificationId },
    data: {
      status: "VERIFIED",
      fieldNotes: notes,
      verifiedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      fieldVisits: {
        orderBy: { visitDate: "desc" },
      },
    },
  });
};

export const searchYouth = async (filters: {
  category?: string;
  country?: string;
  camp?: string;
  status?: string;
}) => {
  const where: any = {
    role: "YOUTH",
  };

  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.country) {
    where.country = filters.country;
  }
  if (filters.camp) {
    where.camp = { contains: filters.camp, mode: "insensitive" };
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      verifications: {
        where: filters.status ? { status: filters.status as any } : undefined,
        take: 1,
      },
      documents: {
        select: {
          id: true,
          type: true,
          fileName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter by verification status if provided
  if (filters.status) {
    return users.filter((user: any) => user.verifications[0]?.status === filters.status);
  }

  return users;
};

