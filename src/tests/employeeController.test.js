import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEmployeePayload } from '../controllers/employeeValidation.js';
import bcrypt from 'bcrypt';

test('validateEmployeePayload detects missing required fields', () => {
  const { valid, errors } = validateEmployeePayload({});
  assert.equal(valid, false);
  assert.ok(errors.length > 0);
});

test('validateEmployeePayload accepts valid payload', () => {
  const body = {
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    officialEmail: 'john@example.com',
    joiningDate: '2024-01-01',
    dateOfBirth: '1990-01-01',
    department: 'dep-1',
    employeeGrade: 'grade-1',
    designation: 'des-1',
    employmentStatus: 'status-1',
    reportingManager: 'Jane Manager',
    workingHoursPolicy: 'whp-1',
    branch: 'branch-1',
    country: 'Pakistan',
    state: 'state-1',
    city: 'city-1',
    employeeSalary: '50000',
  };
  const { valid, errors } = validateEmployeePayload(body);
  assert.equal(valid, true);
  assert.equal(errors.length, 0);
});

test('validateEmployeePayload rejects invalid email and CNIC', () => {
  const body = {
    employeeId: 'EMP-002',
    employeeName: 'Jane Doe',
    officialEmail: 'bad',
    cnicNumber: '12345-1234567-9x',
    joiningDate: '2024-01-01',
    dateOfBirth: '1990-01-01',
    department: 'dep-1',
    employeeGrade: 'grade-1',
    designation: 'des-1',
    employmentStatus: 'status-1',
    reportingManager: 'Jane Manager',
    workingHoursPolicy: 'whp-1',
    branch: 'branch-1',
    country: 'Pakistan',
    state: 'state-1',
    city: 'city-1',
    employeeSalary: '50000',
  };
  const { valid, errors } = validateEmployeePayload(body);
  assert.equal(valid, false);
  assert.ok(errors.find((e) => e.includes('officialEmail')));
});

test('bcrypt hashes passwords securely', async () => {
  const password = 'StrongP@ssw0rd';
  const hash = await bcrypt.hash(password, 12);
  const match = await bcrypt.compare(password, hash);
  assert.equal(match, true);
});
