// @ts-ignore - allow using generated Prisma client types when prisma generate has run
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", SALT_ROUNDS);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@riseupafrica.org" },
    update: {},
    create: {
      email: "admin@riseupafrica.org",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });
  console.log("✅ Created admin:", admin.email);

  // Create Field Agent
  const fieldAgent = await prisma.user.upsert({
    where: { email: "fieldagent@riseupafrica.org" },
    update: {},
    create: {
      email: "fieldagent@riseupafrica.org",
      password: hashedPassword,
      firstName: "Field",
      lastName: "Agent",
      role: "FIELD_AGENT",
    },
  });
  console.log("✅ Created field agent:", fieldAgent.email);

  // Create Donor
  const donor = await prisma.user.upsert({
    where: { email: "donor@example.org" },
    update: {},
    create: {
      email: "donor@example.org",
      password: hashedPassword,
      firstName: "Donor",
      lastName: "Organization",
      role: "DONOR",
      organizationName: "Example Foundation",
      organizationType: "NGO",
    },
  });
  console.log("✅ Created donor:", donor.email);

  // Create Youth User
  const youth = await prisma.user.upsert({
    where: { email: "youth@example.com" },
    update: {},
    create: {
      email: "youth@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      phone: "+1234567890",
      role: "YOUTH",
      category: "REFUGEE",
      country: "Kenya",
      camp: "Kakuma Refugee Camp",
      community: "Block A",
      dateOfBirth: new Date("2000-01-15"),
      gender: "Male",
    },
  });
  console.log("✅ Created youth:", youth.email);

  // Create Verification for Youth
  const verification = await prisma.verification.upsert({
    where: { userId: youth.id },
    update: {},
    create: {
      userId: youth.id,
      status: "PENDING",
    },
  });
  console.log("✅ Created verification for youth");

  // Create Documents for Youth
  const documents = [
    {
      userId: youth.id,
      type: "ID",
      fileName: "national_id.pdf",
      fileUrl: "https://example.com/documents/national_id.pdf",
      mimeType: "application/pdf",
      size: 102400,
    },
    {
      userId: youth.id,
      type: "TRANSCRIPT",
      fileName: "transcript.pdf",
      fileUrl: "https://example.com/documents/transcript.pdf",
      mimeType: "application/pdf",
      size: 204800,
    },
    {
      userId: youth.id,
      type: "RECOMMENDATION_LETTER",
      fileName: "recommendation.pdf",
      fileUrl: "https://example.com/documents/recommendation.pdf",
      mimeType: "application/pdf",
      size: 153600,
    },
  ];

  for (const doc of documents) {
    await prisma.document.create({
      data: doc,
    });
  }
  console.log("✅ Created documents for youth");

  // Create Opportunity
  const opportunity = await prisma.opportunity.create({
    data: {
      donorId: donor.id,
      title: "Scholarship Program 2024",
      description:
        "Full scholarship program for refugees and IDPs to pursue higher education. Covers tuition, accommodation, and living expenses.",
      requirements:
        "Must be a verified refugee or IDP, completed secondary education, demonstrate financial need.",
      category: ["REFUGEE", "IDP"],
      countries: ["Kenya", "Uganda", "Tanzania"],
      deadline: new Date("2024-12-31"),
      maxApplicants: 50,
      isActive: true,
    },
  });
  console.log("✅ Created opportunity:", opportunity.title);

  // Create another opportunity
  const opportunity2 = await prisma.opportunity.create({
    data: {
      donorId: donor.id,
      title: "Vocational Training Program",
      description:
        "Free vocational training in various trades including carpentry, tailoring, and computer skills.",
      requirements: "Must be between 18-30 years old, verified status required.",
      category: ["REFUGEE", "IDP", "VULNERABLE", "PWD"],
      countries: ["Kenya", "Uganda"],
      deadline: new Date("2024-11-30"),
      maxApplicants: 100,
      isActive: true,
    },
  });
  console.log("✅ Created opportunity:", opportunity2.title);

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Test Credentials:");
  console.log("Admin: admin@riseupafrica.org / password123");
  console.log("Field Agent: fieldagent@riseupafrica.org / password123");
  console.log("Donor: donor@example.org / password123");
  console.log("Youth: youth@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

