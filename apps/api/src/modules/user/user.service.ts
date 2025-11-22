import prisma from "../../prisma/client";
import type { UpdateProfileInput } from "./user.schema";

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      category: true,
      country: true,
      camp: true,
      community: true,
      dateOfBirth: true,
      gender: true,
      organizationName: true,
      organizationType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserProfile = async (userId: string, input: UpdateProfileInput) => {
  const { dateOfBirth, ...rest } = input;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      category: true,
      country: true,
      camp: true,
      community: true,
      dateOfBirth: true,
      gender: true,
      organizationName: true,
      organizationType: true,
      updatedAt: true,
    },
  });

  return user;
};

export const getUserDocuments = async (userId: string) => {
  return await prisma.document.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
};

export const getUserVerification = async (userId: string) => {
  return await prisma.verification.findUnique({
    where: { userId },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
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
      fieldVisits: {
        orderBy: { visitDate: "desc" },
      },
    },
  });
};

export const getUsers = async (options: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  role?: string;
}) => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.role) where.role = options.role;

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [options.sort || "createdAt"]: options.order || "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        category: true,
        country: true,
        camp: true,
        createdAt: true,
        // Verification is a related model; schema uses 'verifications' on the User model
        verifications: { select: { status: true } },
      },
    }),
  ]);

  // Map the verifications array (0/1) to a single `verification` field for compatibility
  const mappedItems = items.map((it: any) => {
    const verification = Array.isArray(it.verifications) && it.verifications.length > 0 ? it.verifications[0] : null;
    // Remove the original verifications array and add single verification
    const { verifications, ...rest } = it;
    return { ...rest, verification };
  });

  return {
    total,
    page,
    limit,
    items: mappedItems,
  };
};

