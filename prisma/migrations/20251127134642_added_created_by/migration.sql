/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Designation` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `JobType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AllowanceHead" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "ApprovalSetting" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "BonusType" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "DeductionHead" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "DegreeType" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Designation" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "JobType" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "LeaveType" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "LeavesPolicy" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "LoanType" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "MaritalStatus" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Qualification" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "SalaryBreakup" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "SubDepartment" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "TaxSlab" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobType" ADD CONSTRAINT "JobType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaritalStatus" ADD CONSTRAINT "MaritalStatus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DegreeType" ADD CONSTRAINT "DegreeType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllowanceHead" ADD CONSTRAINT "AllowanceHead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeductionHead" ADD CONSTRAINT "DeductionHead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanType" ADD CONSTRAINT "LoanType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveType" ADD CONSTRAINT "LeaveType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavesPolicy" ADD CONSTRAINT "LeavesPolicy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryBreakup" ADD CONSTRAINT "SalaryBreakup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxSlab" ADD CONSTRAINT "TaxSlab_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusType" ADD CONSTRAINT "BonusType_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalSetting" ADD CONSTRAINT "ApprovalSetting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDepartment" ADD CONSTRAINT "SubDepartment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
