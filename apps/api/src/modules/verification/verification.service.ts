import prisma from "../../prisma/client";
import type {
  UploadDocumentInput,
  AdminReviewInput,
  FieldVisitInput,
  AssignFieldAgentInput,
} from "./verification.schema";

export const uploadDocument = async (userId: string, input: UploadDocumentInput) => {
  // If a document of the same type already exists for this user,
  // replace it by performing an update. This avoids duplicate
  // documents for the same (userId, type). Return an object with
  // the saved document and an `action` indicating whether it was
  // created or replaced.
  const existing = await prisma.document.findFirst({
    where: { userId, type: input.type },
  });

  if (existing) {
    const updated = await prisma.document.update({
      where: { id: existing.id },
      data: {
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        size: input.size,
        uploadedAt: new Date(),
      },
    });
    return { document: updated, action: "replaced" as const };
  }

  const created = await prisma.document.create({
    data: {
      userId,
      ...input,
    },
  });
  return { document: created, action: "created" as const };
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

/**
 * Schedule a field visit as an ADMIN. This finds a FIELD_AGENT with a
 * matching location (country or camp) to the youth on the verification,
 * assigns the agent to the verification, and creates the field visit.
 */
export const scheduleFieldVisit = async (
  adminId: string,
  input: {
    verificationId: string;
    visitDate: string;
    notes?: string;
    photos?: string[];
  }
) => {
  const { verificationId, visitDate, notes, photos } = input;

  // Load verification with user location info
  const verification = await prisma.verification.findUnique({
    where: { id: verificationId },
    include: { user: true },
  });

  if (!verification) {
    throw new Error("Verification not found");
  }

  const userCountry = verification.user?.country || undefined;
  const userCamp = verification.user?.camp || undefined;
  const userCommunity = verification.user?.community || undefined;

  // Prefer agents who match the youth's camp (or community treated as alternate camp).
  // If none found, fall back to matching by country. If still none found, return an error.
  let agent = null;

  if (userCamp || userCommunity) {
    const campConditions: any[] = [];
    if (userCamp) campConditions.push({ camp: { equals: userCamp } });
    if (userCommunity) campConditions.push({ camp: { equals: userCommunity } });

    agent = await prisma.user.findFirst({
      where: { role: "FIELD_AGENT", OR: campConditions },
    });
  }

  if (!agent && userCountry) {
    agent = await prisma.user.findFirst({
      where: { role: "FIELD_AGENT", country: { equals: userCountry } },
    });
  }

  if (!agent) {
    throw new Error("No field agents available in the youth's camp or country to schedule the visit");
  }

  // Assign the agent to the verification if not already assigned
  await prisma.verification.update({
    where: { id: verificationId },
    data: { fieldAgentId: agent.id, status: "UNDER_REVIEW" },
  });

  // Create the field visit record
  const visit = await prisma.fieldVisit.create({
    data: {
      verificationId,
      fieldAgentId: agent.id,
      visitDate: new Date(visitDate),
      notes,
      photos: photos || [],
    },
    include: {
      verification: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  return { visit, assignedAgent: { id: agent.id, firstName: agent.firstName, lastName: agent.lastName, email: agent.email } };
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
    // Allow case-insensitive partial matches for country so searches like
    // "kenya", "Kenya" or "Ken" will match stored values.
    where.country = { contains: filters.country, mode: "insensitive" };
  }
  if (filters.camp) {
    // Match camp OR community (both stored on the user) so the frontend
    // "Camp/Community" input will find users whether the value is saved
    // in `camp` or `community`.
    where.OR = [
      { camp: { contains: filters.camp, mode: "insensitive" } },
      { community: { contains: filters.camp, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      // `verifications` is the relation name on User (array); include it and map below
      verifications: filters.status
        ? { where: { status: filters.status as any } }
        : { select: { status: true } },
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
  // Map verifications array to a single `verification` field for compatibility
  const mapped = users.map((u: any) => {
    const verification = Array.isArray(u.verifications) && u.verifications.length > 0 ? u.verifications[0] : null;
    const { verifications, ...rest } = u;
    return { ...rest, verification };
  });

  if (filters.status) {
    return mapped.filter((user) => user.verification?.status === filters.status);
  }

  return mapped;
};

