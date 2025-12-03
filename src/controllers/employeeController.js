import prisma from '@/models/database.js';

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

    // Validation
    if (!employeeId || !employeeName || !officialEmail) {
      return res.status(400).json({ status: false, message: 'Employee ID, Name, and Official Email are required' });
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

    // Create employee
    const employee = await prisma.employee.create({
      data: {
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
        cnicNumber: cnicNumber?.replace(/-/g, '') || '', // Remove dashes from CNIC
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
        password: password?.trim() || null, // Note: In production, hash this password
        roles: roles?.trim() || null,
        status: 'active',
      },
    });

    res.status(201).json({ status: true, data: employee, message: 'Employee created successfully' });
  } catch (error) {
    console.error('Error creating employee:', error);
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

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });
    res.json({ status: true, data: employee, message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error updating employee:', error);
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
    await prisma.employee.delete({ where: { id } });
    res.json({ status: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete employee' });
  }
};

