-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "applicationLink" TEXT;
