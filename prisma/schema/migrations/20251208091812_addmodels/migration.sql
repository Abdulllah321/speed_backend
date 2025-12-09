/*
  Warnings:

  - You are about to drop the column `subDepartment` on the `Qualification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "LeavesPolicy" ADD COLUMN     "fullDayDeductionRate" DECIMAL(65,30),
ADD COLUMN     "halfDayDeductionRate" DECIMAL(65,30),
ADD COLUMN     "policyDateFrom" TIMESTAMP(3),
ADD COLUMN     "policyDateTill" TIMESTAMP(3),
ADD COLUMN     "shortLeaveDeductionRate" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Qualification" DROP COLUMN "subDepartment";

-- CreateTable
CREATE TABLE "LeavesPolicyLeaveType" (
    "id" TEXT NOT NULL,
    "leavesPolicyId" TEXT NOT NULL,
    "leaveTypeId" TEXT NOT NULL,
    "numberOfLeaves" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeavesPolicyLeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeGrade" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeStatus" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusType" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvidentFund" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvidentFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHoursPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startWorkingHours" TEXT NOT NULL,
    "endWorkingHours" TEXT NOT NULL,
    "shortDayMins" INTEGER,
    "startBreakTime" TEXT,
    "endBreakTime" TEXT,
    "halfDayStartTime" TEXT,
    "lateStartTime" TEXT,
    "lateDeductionType" TEXT,
    "applyDeductionAfterLates" INTEGER,
    "lateDeductionPercent" DECIMAL(65,30),
    "halfDayDeductionType" TEXT,
    "applyDeductionAfterHalfDays" INTEGER,
    "halfDayDeductionAmount" DECIMAL(65,30),
    "shortDayDeductionType" TEXT,
    "applyDeductionAfterShortDays" INTEGER,
    "shortDayDeductionAmount" DECIMAL(65,30),
    "overtimeRate" DECIMAL(65,30),
    "gazzetedOvertimeRate" DECIMAL(65,30),
    "dayOverrides" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHoursPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeavesPolicyLeaveType_leavesPolicyId_leaveTypeId_key" ON "LeavesPolicyLeaveType"("leavesPolicyId", "leaveTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGrade_grade_key" ON "EmployeeGrade"("grade");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeStatus_status_key" ON "EmployeeStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProvidentFund_name_key" ON "ProvidentFund"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHoursPolicy_name_key" ON "WorkingHoursPolicy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavesPolicyLeaveType" ADD CONSTRAINT "LeavesPolicyLeaveType_leavesPolicyId_fkey" FOREIGN KEY ("leavesPolicyId") REFERENCES "LeavesPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavesPolicyLeaveType" ADD CONSTRAINT "LeavesPolicyLeaveType_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeGrade" ADD CONSTRAINT "EmployeeGrade_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStatus" ADD CONSTRAINT "EmployeeStatus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvidentFund" ADD CONSTRAINT "ProvidentFund_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHoursPolicy" ADD CONSTRAINT "WorkingHoursPolicy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileUpload" ADD CONSTRAINT "FileUpload_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
