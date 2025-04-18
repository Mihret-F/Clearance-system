/*
  Warnings:

  - You are about to drop the column `departmentName` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `typeName` on the `document_types` table. All the data in the column will be lost.
  - You are about to drop the column `reasonName` on the `id_replacement_reasons` table. All the data in the column will be lost.
  - You are about to drop the column `subtype` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `reasonName` on the `termination_reasons` table. All the data in the column will be lost.
  - Added the required column `name` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `document_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `id_replacement_reasons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `offices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `programs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `semester` on the `students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `reason` to the `termination_reasons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "FormType" ADD VALUE 'TEACHER_CLEARANCE';

-- DropForeignKey
ALTER TABLE "workflow_rules" DROP CONSTRAINT "workflow_rules_programId_fkey";

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "departmentName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "document_types" DROP COLUMN "typeName",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "id_replacement_reasons" DROP COLUMN "reasonName",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "offices" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "programs" DROP COLUMN "subtype",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "semester",
ADD COLUMN     "semester" INTEGER NOT NULL,
ALTER COLUMN "academicStatus" SET DEFAULT 'ENROLLED';

-- AlterTable
ALTER TABLE "termination_reasons" DROP COLUMN "reasonName",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "reason" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "browserFingerprint" TEXT,
ADD COLUMN     "emailToken" TEXT,
ADD COLUMN     "emailTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerificationSkipped" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockCycles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "workflow_rules" ADD COLUMN     "description" TEXT,
ALTER COLUMN "programId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "workflow_steps" ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_rules" ADD CONSTRAINT "workflow_rules_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
