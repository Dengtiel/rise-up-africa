import prisma from "../../prisma/client";
import type {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
} from "./application.schema";

export const createApplication = async (
  youthId: string,
  input: CreateApplicationInput
) => {
  const { opportunityId } = input;

  // Check if opportunity exists and is active
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  if (!opportunity.isActive) {
    throw new Error("This opportunity is no longer active");
  }

  if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
    throw new Error("The deadline for this opportunity has passed");
  }

  // Check if user is verified
  const verification = await prisma.verification.findUnique({
    where: { userId: youthId },
  });

  if (!verification || verification.status !== "VERIFIED") {
    throw new Error("You must be verified before applying to opportunities");
  }

  // Check if already applied
  const existingApplication = await prisma.application.findUnique({
    where: {
      youthId_opportunityId: {
        youthId,
        opportunityId,
      },
    },
  });

  if (existingApplication) {
    throw new Error("You have already applied to this opportunity");
  }

  // Check max applicants if set
  if (opportunity.maxApplicants) {
    const applicationCount = await prisma.application.count({
      where: { opportunityId },
    });

    if (applicationCount >= opportunity.maxApplicants) {
      throw new Error("This opportunity has reached its maximum number of applicants");
    }
  }

  return await prisma.application.create({
    data: {
      youthId,
      opportunityId,
      coverLetter: input.coverLetter,
      additionalInfo: input.additionalInfo,
    },
    include: {
      opportunity: {
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },
      youth: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          category: true,
          country: true,
        },
      },
    },
  });
};

export const getYouthApplications = async (youthId: string) => {
  return await prisma.application.findMany({
    where: { youthId },
    include: {
      opportunity: {
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
};

export const getOpportunityApplications = async (
  opportunityId: string,
  donorId: string
) => {
  // Verify ownership
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  if (opportunity.donorId !== donorId) {
    throw new Error("Unauthorized: You can only view applications for your own opportunities");
  }
  // Fetch applications and map youth.verifications array to a single `verification` field
  const apps = await prisma.application.findMany({
    where: { opportunityId },
    include: {
      youth: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          category: true,
          country: true,
          camp: true,
          community: true,
          verifications: {
            select: {
              id: true,
              status: true,
            },
            take: 1,
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return apps.map((app: any) => {
    const { youth } = app as any;
    const verification = (youth?.verifications && youth.verifications[0]) || null;
    const transformedYouth = { ...youth, verification };
    delete (transformedYouth as any).verifications;
    return { ...app, youth: transformedYouth };
  });
};

export const updateApplicationStatus = async (
  applicationId: string,
  donorId: string,
  input: UpdateApplicationStatusInput
) => {
  // Get application with opportunity
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.opportunity.donorId !== donorId) {
    throw new Error("Unauthorized: You can only update applications for your own opportunities");
  }

  return await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: input.status,
    },
    include: {
      opportunity: {
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },
      youth: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          category: true,
          country: true,
        },
      },
    },
  });
};

export const getApplicationById = async (applicationId: string, userId: string) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: {
        include: {
          donor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              organizationName: true,
            },
          },
        },
      },
      youth: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          category: true,
          country: true,
          camp: true,
          community: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Verify access
  if (application.youthId !== userId && application.opportunity.donorId !== userId) {
    throw new Error("Unauthorized: You can only view your own applications");
  }

  return application;
};

