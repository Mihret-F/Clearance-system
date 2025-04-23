/*
  Warnings:

  - Added the required column `yearsOfExperience` to the `approvers` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `semester` on the `students` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `yearsOfService` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('SPRING', 'FALL', 'SUMMER');

-- DropForeignKey
ALTER TABLE "offices" DROP CONSTRAINT "offices_departmentId_fkey";

-- AlterTable
ALTER TABLE "approvers" ADD COLUMN     "yearsOfExperience" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "clearance_requests" ADD COLUMN     "rejectedStep" INTEGER,
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "offices" ALTER COLUMN "departmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "semester",
ADD COLUMN     "semester" "Semester" NOT NULL;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "yearsOfService" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "offices" ADD CONSTRAINT "offices_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
