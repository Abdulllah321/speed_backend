import prisma from '@/models/database.js';
import activityLogService from '@/services/activityLogService.js';
import { logActivity } from '@/util/activityLogHelper.js';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';

export const validateEmployeePayload = (body) => {
  const errors = [];
  const required = ['employeeId', 'employeeName', 'officialEmail', 'joiningDate', 'dateOfBirth', 'department', 'employeeGrade', 'designation', 'employmentStatus', 'reportingManager', 'workingHoursPolicy', 'branch', 'country', 'state', 'city', 'employeeSalary'];
  for (const key of required) {
    if (!body[key] || (typeof body[key] === 'string' && !body[key].trim())) errors.push(`${key} is required`);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (body.officialEmail && !emailRegex.test(body.officialEmail)) errors.push('officialEmail is invalid');
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  if (body.cnicNumber && !cnicRegex.test(body.cnicNumber)) errors.push('cnicNumber must be XXXXX-XXXXXXX-X');
  if (body.employeeSalary && isNaN(Number(body.employeeSalary))) errors.push('employeeSalary must be numeric');
  return { valid: errors.length === 0, errors };
};

const hashPasswordIfProvided = async (password) => {
  if (!password || !password.trim()) return null;
  const saltRounds = 12;
  return bcrypt.hash(password.trim(), saltRounds);
};

// CSV import storage (public/csv)
const csvRoot = path.join(process.cwd(), 'public', 'csv');
if (!fs.existsSync(csvRoot)) {
  fs.mkdirSync(csvRoot, { recursive: true });
}

const csvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, csvRoot),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${ts}_${safe}`);
  },
});

const csvUploadMiddleware = multer({
  storage: csvStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const lower = file.originalname.toLowerCase();
    const isCsv =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      lower.endsWith('.csv');
    const isExcel =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      lower.endsWith('.xlsx') ||
      lower.endsWith('.xls');
    if (!isCsv && !isExcel) {
      return cb(new Error('Only CSV or Excel (xlsx/xls) files are allowed'));
    }
    cb(null, true);
  },
}).single('file');

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all related data for mapping
    const [departments, subDepartments, designations, employeeGrades, branches, states, cities, maritalStatuses, workingHoursPolicies, leavesPolicies, employeeStatuses] = await Promise.all([
      prisma.department.findMany().catch(() => []),
      prisma.subDepartment.findMany().catch(() => []),
      prisma.designation.findMany().catch(() => []),
      prisma.employeeGrade.findMany().catch(() => []),
      prisma.branch.findMany().catch(() => []),
      prisma.state.findMany().catch(() => []),
      prisma.city.findMany().catch(() => []),
      prisma.maritalStatus.findMany().catch(() => []),
      prisma.workingHoursPolicy.findMany().catch(() => []),
      prisma.leavesPolicy.findMany().catch(() => []),
      prisma.employeeStatus.findMany().catch(() => []),
    ]);

    // Create lookup maps
    const departmentMap = new Map(departments.map(d => [d.id, d.name]));
    const subDepartmentMap = new Map(subDepartments.map(sd => [sd.id, sd.name]));
    const designationMap = new Map(designations.map(d => [d.id, d.name]));
    const gradeMap = new Map(employeeGrades.map(eg => [eg.id, eg.grade]));
    const branchMap = new Map(branches.map(b => [b.id, b.name]));
    const stateMap = new Map(states.map(s => [s.id, s.name]));
    const cityMap = new Map(cities.map(c => [c.id, c.name]));
    const maritalStatusMap = new Map(maritalStatuses.map(ms => [ms.id, ms.name]));
    const workingHoursPolicyMap = new Map(workingHoursPolicies.map(whp => [whp.id, whp.name]));
    const leavesPolicyMap = new Map(leavesPolicies.map(lp => [lp.id, lp.name]));
    const employeeStatusMap = new Map(employeeStatuses.map(es => [es.id, es.status]));

    // Map employees with names
    const data = employees.map(emp => ({
      ...emp,
      departmentName: departmentMap.get(emp.department) || emp.department,
      subDepartmentName: emp.subDepartment ? (subDepartmentMap.get(emp.subDepartment) || emp.subDepartment) : null,
      designationName: designationMap.get(emp.designation) || emp.designation,
      employeeGradeName: gradeMap.get(emp.employeeGrade) || emp.employeeGrade,
      branchName: branchMap.get(emp.branch) || emp.branch,
      provinceName: stateMap.get(emp.province) || emp.province,
      cityName: cityMap.get(emp.city) || emp.city,
      maritalStatusName: maritalStatusMap.get(emp.maritalStatus) || emp.maritalStatus,
      workingHoursPolicyName: workingHoursPolicyMap.get(emp.workingHoursPolicy) || emp.workingHoursPolicy,
      leavesPolicyName: leavesPolicyMap.get(emp.leavesPolicy) || emp.leavesPolicy,
      employmentStatusName: employeeStatusMap.get(emp.employmentStatus) || emp.employmentStatus,
    }));

    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch employees' });
  }
};

// Get employee by id
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }

    // Fetch related data for names
    const [department, subDepartment, designation, grade, branch, state, city, maritalStatus, workingHoursPolicy, leavesPolicy, employmentStatus] = await Promise.all([
      employee.department ? prisma.department.findUnique({ where: { id: employee.department } }).catch(() => null) : null,
      employee.subDepartment ? prisma.subDepartment.findUnique({ where: { id: employee.subDepartment } }).catch(() => null) : null,
      employee.designation ? prisma.designation.findUnique({ where: { id: employee.designation } }).catch(() => null) : null,
      employee.employeeGrade ? prisma.employeeGrade.findUnique({ where: { id: employee.employeeGrade } }).catch(() => null) : null,
      employee.branch ? prisma.branch.findUnique({ where: { id: employee.branch } }).catch(() => null) : null,
      employee.province ? prisma.state.findUnique({ where: { id: employee.province } }).catch(() => null) : null,
      employee.city ? prisma.city.findUnique({ where: { id: employee.city } }).catch(() => null) : null,
      employee.maritalStatus ? prisma.maritalStatus.findUnique({ where: { id: employee.maritalStatus } }).catch(() => null) : null,
      employee.workingHoursPolicy ? prisma.workingHoursPolicy.findUnique({ where: { id: employee.workingHoursPolicy } }).catch(() => null) : null,
      employee.leavesPolicy ? prisma.leavesPolicy.findUnique({ where: { id: employee.leavesPolicy } }).catch(() => null) : null,
      employee.employmentStatus ? prisma.employeeStatus.findUnique({ where: { id: employee.employmentStatus } }).catch(() => null) : null,
    ]);

    const data = {
      ...employee,
      departmentName: department?.name || employee.department,
      subDepartmentName: subDepartment?.name || employee.subDepartment,
      designationName: designation?.name || employee.designation,
      employeeGradeName: grade?.grade || employee.employeeGrade,
      branchName: branch?.name || employee.branch,
      provinceName: state?.name || employee.province,
      cityName: city?.name || employee.city,
      maritalStatusName: maritalStatus?.name || employee.maritalStatus,
      workingHoursPolicyName: workingHoursPolicy?.name || employee.workingHoursPolicy,
      leavesPolicyName: leavesPolicy?.name || employee.leavesPolicy,
      employmentStatusName: employmentStatus?.status || employee.employmentStatus,
    };

    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch employee' });
  }
};

// Create employee
export const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      fatherHusbandName,
      department,
      subDepartment,
      employeeGrade,
      attendanceId,
      designation,
      maritalStatus,
      employmentStatus,
      probationExpiryDate,
      cnicNumber,
      cnicExpiryDate,
      lifetimeCnic,
      joiningDate,
      dateOfBirth,
      nationality,
      gender,
      contactNumber,
      emergencyContactNumber,
      emergencyContactPersonName,
      personalEmail,
      officialEmail,
      country,
      state, // Frontend sends 'state' but schema has 'province'
      city,
      employeeSalary,
      eobi,
      eobiNumber,
      providentFund,
      overtimeApplicable,
      daysOff,
      reportingManager,
      workingHoursPolicy,
      branch,
      leavesPolicy,
      allowRemoteAttendance,
      currentAddress,
      permanentAddress,
      bankName,
      accountNumber,
      accountTitle,
      selectedEquipments, // Array of equipment IDs
      accountType,
      password,
      roles,
    } = req.body;

    const { valid, errors } = validateEmployeePayload(req.body);
    if (!valid) {
      console.log('Employee validation failed:', { errors, receivedFields: Object.keys(req.body) });
      return res.status(400).json({ status: false, message: errors.join(', ') });
    }

    // Check for duplicate employeeId
    const existingEmployeeId = await prisma.employee.findUnique({
      where: { employeeId },
    });
    if (existingEmployeeId) {
      return res.status(400).json({ status: false, message: 'Employee ID already exists' });
    }

    // Check for duplicate officialEmail
    const existingEmail = await prisma.employee.findUnique({
      where: { officialEmail },
    });
    if (existingEmail) {
      return res.status(400).json({ status: false, message: 'Official Email already exists' });
    }

    // Check for duplicate cnicNumber if provided
    if (cnicNumber) {
      const existingCNIC = await prisma.employee.findUnique({
        where: { cnicNumber },
      });
      if (existingCNIC) {
        return res.status(400).json({ status: false, message: 'CNIC Number already exists' });
      }
    }

    // Map selectedEquipments array to boolean fields
    const equipmentMap = {
      laptop: false,
      card: false,
      mobileSim: false,
      key: false,
      tools: false,
    };

    // If selectedEquipments is provided, fetch equipment names and map them
    if (selectedEquipments && Array.isArray(selectedEquipments) && selectedEquipments.length > 0) {
      try {
        const equipments = await prisma.equipment.findMany({
          where: { id: { in: selectedEquipments } },
        });
        
        // Map equipment names (case-insensitive) to boolean fields
        equipments.forEach((equipment) => {
          const name = equipment.name.toLowerCase();
          if (name.includes('laptop')) equipmentMap.laptop = true;
          else if (name.includes('card') || name.includes('id card')) equipmentMap.card = true;
          else if (name.includes('sim') || name.includes('mobile sim')) equipmentMap.mobileSim = true;
          else if (name.includes('key') || name.includes('keys')) equipmentMap.key = true;
          else if (name.includes('tool')) equipmentMap.tools = true;
        });
      } catch (error) {
        console.error('Error fetching equipments:', error);
        // Continue with default values if equipment fetch fails
      }
    }

    const txResult = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: officialEmail } });
      if (existingUser) return { error: { code: 409, message: 'User with this email already exists' } };

      const hashed = await hashPasswordIfProvided(password);
      const generateIfMissing = !hashed;
      const tempPassword = generateIfMissing ? Math.random().toString(36).slice(2) + 'A1!' : null;
      const finalHash = hashed || await bcrypt.hash(tempPassword, 12);

      const nameParts = employeeName.trim().split(' ');
      const firstName = nameParts.shift() || employeeName.trim();
      const lastName = nameParts.join(' ') || '-';

      const user = await tx.user.create({
        data: {
          email: officialEmail.trim(),
          password: finalHash,
          firstName,
          lastName,
          phone: contactNumber?.trim() || null,
          avatar: null,
          employeeId: employeeId.trim(),
          mustChangePassword: generateIfMissing ? true : false,
          status: 'active',
        },
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId: employeeId.trim(),
          employeeName: employeeName.trim(),
          fatherHusbandName: fatherHusbandName?.trim() || '',
          department: department?.trim() || '',
          subDepartment: subDepartment?.trim() || null,
          employeeGrade: employeeGrade?.trim() || '',
          attendanceId: attendanceId?.trim() || '',
          designation: designation?.trim() || '',
          maritalStatus: maritalStatus?.trim() || '',
          employmentStatus: employmentStatus?.trim() || '',
          probationExpiryDate: probationExpiryDate ? new Date(probationExpiryDate) : null,
          cnicNumber: cnicNumber?.replace(/-/g, '') || '',
          cnicExpiryDate: cnicExpiryDate ? new Date(cnicExpiryDate) : null,
          lifetimeCnic: lifetimeCnic || false,
          joiningDate: new Date(joiningDate),
          dateOfBirth: new Date(dateOfBirth),
          nationality: nationality?.trim() || '',
          gender: gender?.trim() || '',
          contactNumber: contactNumber?.trim() || '',
          emergencyContactNumber: emergencyContactNumber?.trim() || null,
          emergencyContactPerson: emergencyContactPersonName?.trim() || null,
          personalEmail: personalEmail?.trim() || null,
          officialEmail: officialEmail.trim(),
          country: country?.trim() || 'Pakistan',
          province: state?.trim() || '', // Map state to province
          city: city?.trim() || '',
          employeeSalary: employeeSalary ? parseFloat(employeeSalary) : 0,
          eobi: eobi || false,
          eobiNumber: eobiNumber?.trim() || null,
          providentFund: providentFund || false,
          overtimeApplicable: overtimeApplicable || false,
          daysOff: daysOff?.trim() || null,
          reportingManager: reportingManager?.trim() || '',
          workingHoursPolicy: workingHoursPolicy?.trim() || '',
          branch: branch?.trim() || '',
          leavesPolicy: leavesPolicy?.trim() || '',
          allowRemoteAttendance: allowRemoteAttendance || false,
          currentAddress: currentAddress?.trim() || null,
          permanentAddress: permanentAddress?.trim() || null,
          bankName: bankName?.trim() || '',
          accountNumber: accountNumber?.trim() || '',
          accountTitle: accountTitle?.trim() || '',
          laptop: equipmentMap.laptop,
          card: equipmentMap.card,
          mobileSim: equipmentMap.mobileSim,
          key: equipmentMap.key,
          tools: equipmentMap.tools,
          accountType: accountType?.trim() || null,
          password: null,
          roles: roles?.trim() || null,
          status: 'active',
        },
      });

      return { employee, user, tempPassword };
    });

    if (txResult?.error) {
      return res.status(txResult.error.code).json({ status: false, message: txResult.error.message });
    }

    const { employee, user, tempPassword } = txResult;

    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create',
      module: 'employees',
      entity: 'Employee',
      entityId: employee.id,
      description: `Created employee: ${employee.employeeName} (${employee.employeeId})`,
      newValues: { employeeId: employee.employeeId, employeeName: employee.employeeName, officialEmail: employee.officialEmail },
      req,
    });

    res.status(201).json({ status: true, data: { employee, user }, message: 'Employee created successfully', tempPassword: tempPassword ? 'Set by system, must change on first login' : undefined });
  } catch (error) {
    console.error('Error creating employee:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create',
      module: 'employees',
      entity: 'Employee',
      description: 'Failed to create employee',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return res.status(400).json({ 
        status: false, 
        message: `Employee with this ${field} already exists` 
      });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create employee' });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedEquipments, ...updateData } = req.body;

    // Convert date strings to Date objects if present
    if (updateData.probationExpiryDate) updateData.probationExpiryDate = new Date(updateData.probationExpiryDate);
    if (updateData.cnicExpiryDate) updateData.cnicExpiryDate = new Date(updateData.cnicExpiryDate);
    if (updateData.joiningDate) updateData.joiningDate = new Date(updateData.joiningDate);
    if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth);

    // Map state to province if provided
    if (updateData.state) {
      updateData.province = updateData.state;
      delete updateData.state;
    }

    // Remove CNIC dashes if present
    if (updateData.cnicNumber) {
      updateData.cnicNumber = updateData.cnicNumber.replace(/-/g, '');
    }

    // Map selectedEquipments array to boolean fields (same logic as createEmployee)
    if (selectedEquipments !== undefined) {
      const equipmentMap = {
        laptop: false,
        card: false,
        mobileSim: false,
        key: false,
        tools: false,
      };

      // If selectedEquipments is provided, fetch equipment names and map them
      if (selectedEquipments && Array.isArray(selectedEquipments) && selectedEquipments.length > 0) {
        try {
          const equipments = await prisma.equipment.findMany({
            where: { id: { in: selectedEquipments } },
          });
          
          // Map equipment names (case-insensitive) to boolean fields
          equipments.forEach((equipment) => {
            const name = equipment.name.toLowerCase();
            if (name.includes('laptop')) equipmentMap.laptop = true;
            else if (name.includes('card') || name.includes('id card')) equipmentMap.card = true;
            else if (name.includes('sim') || name.includes('mobile sim')) equipmentMap.mobileSim = true;
            else if (name.includes('key') || name.includes('keys')) equipmentMap.key = true;
            else if (name.includes('tool')) equipmentMap.tools = true;
          });
        } catch (error) {
          console.error('Error fetching equipments:', error);
          // Continue with default values if equipment fetch fails
        }
      }

      // Add equipment boolean fields to updateData
      updateData.laptop = equipmentMap.laptop;
      updateData.card = equipmentMap.card;
      updateData.mobileSim = equipmentMap.mobileSim;
      updateData.key = equipmentMap.key;
      updateData.tools = equipmentMap.tools;
    }

    const oldEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!oldEmployee) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'update',
      module: 'employees',
      entity: 'Employee',
      entityId: employee.id,
      description: `Updated employee: ${employee.employeeName} (${employee.employeeId})`,
      oldValues: { employeeName: oldEmployee.employeeName, employeeId: oldEmployee.employeeId },
      newValues: { employeeName: employee.employeeName, employeeId: employee.employeeId },
      req,
    });

    res.json({ status: true, data: employee, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'update',
      module: 'employees',
      entity: 'Employee',
      entityId: req.params.id,
      description: 'Failed to update employee',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Employee with this unique field already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update employee' });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ status: false, message: 'Employee not found' });
    }

    await prisma.employee.delete({ where: { id } });

    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'delete',
      module: 'employees',
      entity: 'Employee',
      entityId: id,
      description: `Deleted employee: ${employee.employeeName} (${employee.employeeId})`,
      oldValues: { employeeName: employee.employeeName, employeeId: employee.employeeId },
      req,
    });

    res.json({ status: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'delete',
      module: 'employees',
      entity: 'Employee',
      entityId: req.params.id,
      description: 'Failed to delete employee',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: error.message || 'Failed to delete employee' });
  }
};

// Import employees from CSV: saves to public/csv and returns parsed rows
export const importEmployeesCsv = [
  (req, res, next) => {
    csvUploadMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ status: false, message: err.message || 'Failed to upload CSV' });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ status: false, message: 'No CSV file provided' });
      }

      const fullPath = path.join(csvRoot, file.filename);
      const lower = file.originalname.toLowerCase();
      let headers = [];
      let rows = [];

      const isExcel =
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        lower.endsWith('.xlsx') ||
        lower.endsWith('.xls');

      const buildObjects = (matrix) => {
        const headerRow = matrix[0] || [];
        const dataRows = matrix.slice(1);
        const keep = headerRow.map((h, idx) => {
          const name = (h ?? '').toString().trim();
          if (name) return true;
          return dataRows.some((r) => {
            const v = r[idx];
            return v !== undefined && v !== null && String(v).trim() !== '';
          });
        });

        const filteredHeaders = [];
        const filteredRows = dataRows.map(() => ({}));

        keep.forEach((shouldKeep, idx) => {
          if (!shouldKeep) return;
          const headerName = (headerRow[idx] ?? '').toString().trim() || `Column_${idx + 1}`;
          filteredHeaders.push(headerName);
          dataRows.forEach((row, rowIdx) => {
            const v = row[idx];
            filteredRows[rowIdx][headerName] =
              v !== undefined && v !== null ? String(v).trim() : '';
          });
        });

        const nonEmptyRows = filteredRows.filter((row) =>
          Object.values(row).some((v) => v !== '')
        );

        return { filteredHeaders, filteredRows: nonEmptyRows };
      };

      if (isExcel) {
        const workbook = XLSX.readFile(fullPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const { filteredHeaders, filteredRows } = buildObjects(matrix);
        headers = filteredHeaders;
        rows = filteredRows;
      } else {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const matrix = raw
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l !== '')
          .map((line) => line.split(',').map((v) => v.trim()));

        if (!matrix.length) {
          return res.status(400).json({ status: false, message: 'CSV file is empty' });
        }

        const { filteredHeaders, filteredRows } = buildObjects(matrix);
        headers = filteredHeaders;
        rows = filteredRows;
      }

      const expectedHeaders = [
        'Employee ID',
        'Employee Name',
        'Father / Husband Name',
        'Department',
        'Sub Department',
        'Employee-Grade',
        'Attendance-ID',
        'Designation',
        'Marital Status',
        'Employment Status',
        'CNIC-Number',
        'Joining-Date',
        'Nationality',
        'Gender',
        'Contact-Number',
        'Offcial-Email',
        'Country',
        'State',
        'City',
        'Employee-Salary(Compensation)',
        'Working-Hours-Policy',
        'Branch',
        'Leaves-Policy',
        'Date of Birth',
      ];

      const missingHeaders = expectedHeaders.filter(
        (h) => !headers.some((col) => col.toLowerCase() === h.toLowerCase())
      );
      if (missingHeaders.length) {
        console.log("Missing Headers", missingHeaders)
        console.log("Headers", headers)
        return res.status(400).json({
          status: false,
          message: `Missing required columns: ${missingHeaders.join(', ')}`,
        });
      }

      const headerMap = {};
      expectedHeaders.forEach((h) => {
        const found = headers.find((col) => col.toLowerCase() === h.toLowerCase());
        if (found) headerMap[h] = found;
      });

      const placeholderDate = new Date('1970-01-01T00:00:00Z');
      const sanitizeString = (val, fallback = 'N/A') => {
        if (val === null || val === undefined) return fallback;
        const t = String(val).trim();
        return t || fallback;
      };
      const parseNumber = (val, fallback = '0') => {
        const num = Number(String(val).replace(/,/g, '').trim());
        if (Number.isFinite(num)) return num.toString();
        return fallback;
      };
      const parseDate = (val) => {
        if (!val) return placeholderDate;
        const cleaned = String(val).replace(/(\d+)(st|nd|rd|th)/gi, '$1');
        const d = new Date(cleaned);
        if (isNaN(d.getTime())) return placeholderDate;
        return d;
      };

      const buildEmail = (rowIdx, employeeId) => {
        const baseId = sanitizeString(employeeId || `emp${rowIdx + 1}`, `emp${rowIdx + 1}`);
        return `${baseId}@example.com`.replace(/[^a-zA-Z0-9@._-]/g, '');
      };

      const toRecord = (row, rowIdx) => {
        const get = (label) => row[headerMap[label]];
        const employeeId = sanitizeString(get('Employee ID'), `EMP-${Date.now()}-${rowIdx + 1}`);
        const officialEmail =
          sanitizeString(get('Offcial-Email'), '').includes('@') && sanitizeString(get('Offcial-Email'), '').length
            ? sanitizeString(get('Offcial-Email'), '')
            : buildEmail(rowIdx, employeeId);

        const salary = parseNumber(get('Employee-Salary(Compensation)'), '0');

        return {
          employeeId,
          employeeName: sanitizeString(get('Employee Name')),
          fatherHusbandName: sanitizeString(get('Father / Husband Name')),
          department: sanitizeString(get('Department')),
          subDepartment: sanitizeString(get('Sub Department'), null),
          employeeGrade: sanitizeString(get('Employee-Grade')),
          attendanceId: sanitizeString(get('Attendance-ID')),
          designation: sanitizeString(get('Designation')),
          maritalStatus: sanitizeString(get('Marital Status')),
          employmentStatus: sanitizeString(get('Employment Status')),
          cnicNumber: sanitizeString(get('CNIC-Number')).replace(/[^0-9]/g, ''),
          joiningDate: parseDate(get('Joining-Date')),
          dateOfBirth: parseDate(get('Date of Birth')),
          nationality: sanitizeString(get('Nationality')),
          gender: sanitizeString(get('Gender')),
          contactNumber: sanitizeString(get('Contact-Number')),
          officialEmail,
          country: sanitizeString(get('Country')),
          province: sanitizeString(get('State')),
          city: sanitizeString(get('City')),
          employeeSalary: salary,
          workingHoursPolicy: sanitizeString(get('Working-Hours-Policy')),
          branch: sanitizeString(get('Branch')),
          leavesPolicy: sanitizeString(get('Leaves-Policy')),
          // placeholders for required fields not present in CSV
          reportingManager: 'N/A',
          bankName: 'N/A',
          accountNumber: 'N/A',
          accountTitle: 'N/A',
          lifetimeCnic: false,
          eobi: false,
          providentFund: false,
          overtimeApplicable: false,
          allowRemoteAttendance: false,
          status: 'active',
        };
      };

      const payload = rows.map((row, idx) => toRecord(row, idx));
      console.log("Payload", payload)
      let inserted = 0;
      if (payload.length) {
        const result = await prisma.employee.createMany({
          data: payload,
          skipDuplicates: true,
        });
        inserted = result.count || 0;
      }

      try {
        fs.unlinkSync(fullPath);
      } catch {}

      return res.status(201).json({
        status: true,
        data: {
          filename: file.originalname,
          storedFilename: file.filename,
          path: path.join('csv', file.filename),
          headers,
          rows,
          inserted,
          total: payload.length,
        },
      });
    } catch (error) {
      console.error('Error importing employees CSV:', error);
      res.status(500).json({ status: false, message: error.message || 'Failed to import CSV' });
    }
  },
];
