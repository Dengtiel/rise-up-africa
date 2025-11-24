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

export const listUsers = async (filters?: { role?: string }) => {
  const where: any = {};
  if (filters?.role) where.role = filters.role as any;

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      country: true,
      camp: true,
      community: true,
    },
    orderBy: { firstName: "asc" },
  });
};

