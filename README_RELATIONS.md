Relationship design between User and Employee

Chosen model: One-to-one association

- Employee references User via `userId` with `onDelete: Cascade` and `onUpdate: Cascade`.
- User exposes optional `employee` back-reference.
- Common attributes reside in `User` (email, password, firstName, lastName, phone, avatar, status, mustChangePassword, employeeId).
- Employee retains employee-specific fields (department, grade, designation, policies, compensation, documents, equipment flags, addresses, CNIC, etc.).

Implementation details

- Prisma schema updates:
  - `employee.prisma`: added `userId` and `user` relation; kept existing fields for backward compatibility.
  - `auth.prisma`: added `employee` optional relation.
- Controller updates:
  - `createEmployee` now uses a transaction to create `User` and `Employee` together.
  - Secure password hashing with `bcrypt` and forced password change when password is not provided.
  - Input validation for required fields, email and CNIC format, numeric salary.
  - Consistent status codes and structured responses.
  - Activity logging maintained.
- Routes updates:
  - Rate limiting applied: strict limits for create/delete and general limits for list/update.

Notes

- Existing `Employee.officialEmail` and `Employee.employeeName` remain for compatibility; responses include both `employee` and `user` objects.
- Future migrations can remove duplicated fields from `Employee` and project from `User` in all read endpoints.

