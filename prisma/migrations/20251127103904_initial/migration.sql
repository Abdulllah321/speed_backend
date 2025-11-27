/*
  Warnings:

  - The primary key for the `ActivityLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AllowanceHead` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ApprovalSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BlacklistedToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BonusType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DeductionHead` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DegreeType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Designation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Equipment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExitClearance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `JobType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeaveType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LeavesPolicy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LoanType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `LoginHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MaritalStatus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Qualification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RolePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SalaryBreakup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SubDepartment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TaxSlab` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "LoginHistory" DROP CONSTRAINT "LoginHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "SubDepartment" DROP CONSTRAINT "SubDepartment_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ActivityLog_id_seq";

-- AlterTable
ALTER TABLE "AllowanceHead" DROP CONSTRAINT "AllowanceHead_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "AllowanceHead_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AllowanceHead_id_seq";

-- AlterTable
ALTER TABLE "ApprovalSetting" DROP CONSTRAINT "ApprovalSetting_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ApprovalSetting_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ApprovalSetting_id_seq";

-- AlterTable
ALTER TABLE "BlacklistedToken" DROP CONSTRAINT "BlacklistedToken_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BlacklistedToken_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BlacklistedToken_id_seq";

-- AlterTable
ALTER TABLE "BonusType" DROP CONSTRAINT "BonusType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BonusType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BonusType_id_seq";

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Branch_id_seq";

-- AlterTable
ALTER TABLE "City" DROP CONSTRAINT "City_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "City_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "City_id_seq";

-- AlterTable
ALTER TABLE "DeductionHead" DROP CONSTRAINT "DeductionHead_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DeductionHead_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DeductionHead_id_seq";

-- AlterTable
ALTER TABLE "DegreeType" DROP CONSTRAINT "DegreeType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DegreeType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DegreeType_id_seq";

-- AlterTable
ALTER TABLE "Department" DROP CONSTRAINT "Department_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Department_id_seq";

-- AlterTable
ALTER TABLE "Designation" DROP CONSTRAINT "Designation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Designation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Designation_id_seq";

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Employee_id_seq";

-- AlterTable
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Equipment_id_seq";

-- AlterTable
ALTER TABLE "ExitClearance" DROP CONSTRAINT "ExitClearance_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExitClearance_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ExitClearance_id_seq";

-- AlterTable
ALTER TABLE "JobType" DROP CONSTRAINT "JobType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "JobType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "JobType_id_seq";

-- AlterTable
ALTER TABLE "LeaveType" DROP CONSTRAINT "LeaveType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LeaveType_id_seq";

-- AlterTable
ALTER TABLE "LeavesPolicy" DROP CONSTRAINT "LeavesPolicy_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LeavesPolicy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LeavesPolicy_id_seq";

-- AlterTable
ALTER TABLE "LoanType" DROP CONSTRAINT "LoanType_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "LoanType_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LoanType_id_seq";

-- AlterTable
ALTER TABLE "LoginHistory" DROP CONSTRAINT "LoginHistory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "LoginHistory_id_seq";

-- AlterTable
ALTER TABLE "MaritalStatus" DROP CONSTRAINT "MaritalStatus_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MaritalStatus_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MaritalStatus_id_seq";

-- AlterTable
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Permission_id_seq";

-- AlterTable
ALTER TABLE "Qualification" DROP CONSTRAINT "Qualification_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Qualification_id_seq";

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Role_id_seq";

-- AlterTable
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ALTER COLUMN "permissionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "RolePermission_id_seq";

-- AlterTable
ALTER TABLE "SalaryBreakup" DROP CONSTRAINT "SalaryBreakup_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SalaryBreakup_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SalaryBreakup_id_seq";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SubDepartment" DROP CONSTRAINT "SubDepartment_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "departmentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "SubDepartment_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SubDepartment_id_seq";

-- AlterTable
ALTER TABLE "TaxSlab" DROP CONSTRAINT "TaxSlab_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TaxSlab_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TaxSlab_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "employeeId" SET DATA TYPE TEXT,
ALTER COLUMN "roleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDepartment" ADD CONSTRAINT "SubDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
