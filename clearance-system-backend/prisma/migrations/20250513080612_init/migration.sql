/*
  Warnings:

  - You are about to drop the column `stepOrder` on the `ApprovalAction` table. All the data in the column will be lost.
  - You are about to drop the column `teacherReason` on the `ClearanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `officeName` on the `Office` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationSkipped` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lockCycles` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `workflow_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_steps` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clearanceRequestId,approverId]` on the table `ApprovalAction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clearanceRequestId]` on the table `IdReplacementReason` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Office` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clearanceRequestId]` on the table `TerminationReason` will be added. If there are existing duplicate values, this will fail.
  - Made the column `programId` on table `ClearanceRequest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `clearanceRequestId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clearanceRequestId` to the `IdReplacementReason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clearanceRequestId` to the `TerminationReason` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('MANAGE_USERS', 'REASSIGN_REQUESTS', 'APPROVE_REQUESTS', 'MANAGE_WORKFLOWS');

-- AlterEnum
ALTER TYPE "NotificationStatus" ADD VALUE 'FAILED';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EMAIL';

-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'RESUBMITTED';

-- DropForeignKey
ALTER TABLE "ClearanceRequest" DROP CONSTRAINT "ClearanceRequest_idReplacementReasonId_fkey";

-- DropForeignKey
ALTER TABLE "ClearanceRequest" DROP CONSTRAINT "ClearanceRequest_programId_fkey";

-- DropForeignKey
ALTER TABLE "ClearanceRequest" DROP CONSTRAINT "ClearanceRequest_terminationReasonId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_requestId_fkey";

-- DropForeignKey
ALTER TABLE "workflow_rules" DROP CONSTRAINT "workflow_rules_programId_fkey";

-- DropForeignKey
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_officeId_fkey";

-- DropForeignKey
ALTER TABLE "workflow_steps" DROP CONSTRAINT "workflow_steps_workflowRuleId_fkey";

-- DropIndex
DROP INDEX "ApprovalAction_clearanceRequestId_stepOrder_idx";

-- DropIndex
DROP INDEX "Office_officeName_key";

-- AlterTable
ALTER TABLE "ApprovalAction" DROP COLUMN "stepOrder",
ADD COLUMN     "actionDueBy" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ClearanceRequest" DROP COLUMN "teacherReason",
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "resubmissionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teacherClearanceReasonId" TEXT,
ALTER COLUMN "programId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "requestId",
ADD COLUMN     "clearanceRequestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DocumentType" ADD COLUMN     "requiredFor" "FormType"[];

-- AlterTable
ALTER TABLE "IdReplacementReason" ADD COLUMN     "clearanceRequestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createdAt",
DROP COLUMN "requestId",
ADD COLUMN     "clearanceRequestId" TEXT,
ADD COLUMN     "emailSentAt" TIMESTAMP(3),
ADD COLUMN     "emailSubject" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "officeName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "yearsOfService" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TerminationReason" ADD COLUMN     "clearanceRequestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationSkipped",
DROP COLUMN "lockCycles";

-- DropTable
DROP TABLE "workflow_rules";

-- DropTable
DROP TABLE "workflow_steps";

-- CreateTable
CREATE TABLE "TeacherClearanceReason" (
    "id" TEXT NOT NULL,
    "clearanceRequestId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "TeacherClearanceReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "clearanceRequestId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "signatures" JSONB,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clearanceRequestId" TEXT,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permissions" "Permission"[],

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRule" (
    "id" TEXT NOT NULL,
    "formType" "FormType" NOT NULL,
    "programId" TEXT,
    "description" TEXT,

    CONSTRAINT "WorkflowRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStep" (
    "id" TEXT NOT NULL,
    "workflowRuleId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "officeId" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherClearanceReason_clearanceRequestId_key" ON "TeacherClearanceReason"("clearanceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_clearanceRequestId_key" ON "Certificate"("clearanceRequestId");

-- CreateIndex
CREATE INDEX "AuditLog_clearanceRequestId_idx" ON "AuditLog"("clearanceRequestId");

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRule_formType_programId_key" ON "WorkflowRule"("formType", "programId");

-- CreateIndex
CREATE INDEX "WorkflowStep_workflowRuleId_stepOrder_idx" ON "WorkflowStep"("workflowRuleId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStep_workflowRuleId_stepOrder_key" ON "WorkflowStep"("workflowRuleId", "stepOrder");

-- CreateIndex
CREATE INDEX "ApprovalAction_clearanceRequestId_idx" ON "ApprovalAction"("clearanceRequestId");

-- CreateIndex
CREATE INDEX "ApprovalAction_approverId_status_idx" ON "ApprovalAction"("approverId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalAction_clearanceRequestId_approverId_key" ON "ApprovalAction"("clearanceRequestId", "approverId");

-- CreateIndex
CREATE INDEX "ClearanceRequest_currentStep_idx" ON "ClearanceRequest"("currentStep");

-- CreateIndex
CREATE UNIQUE INDEX "IdReplacementReason_clearanceRequestId_key" ON "IdReplacementReason"("clearanceRequestId");

-- CreateIndex
CREATE INDEX "Notification_clearanceRequestId_idx" ON "Notification"("clearanceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Office_name_key" ON "Office"("name");

-- CreateIndex
CREATE INDEX "Program_type_category_idx" ON "Program"("type", "category");

-- CreateIndex
CREATE UNIQUE INDEX "TerminationReason_clearanceRequestId_key" ON "TerminationReason"("clearanceRequestId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- AddForeignKey
ALTER TABLE "TerminationReason" ADD CONSTRAINT "TerminationReason_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdReplacementReason" ADD CONSTRAINT "IdReplacementReason_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherClearanceReason" ADD CONSTRAINT "TeacherClearanceReason_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_clearanceRequestId_fkey" FOREIGN KEY ("clearanceRequestId") REFERENCES "ClearanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRule" ADD CONSTRAINT "WorkflowRule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_workflowRuleId_fkey" FOREIGN KEY ("workflowRuleId") REFERENCES "WorkflowRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStep" ADD CONSTRAINT "WorkflowStep_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceRequest" ADD CONSTRAINT "ClearanceRequest_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
