import prisma from '@/models/database.js';

// Get all exit clearance records
export const getAllExitClearances = async (req, res) => {
  try {
    const clearances = await prisma.exitClearance.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Resolve names from master tables for all clearances
    const resolvedClearances = await Promise.all(
      clearances.map(async (clearance) => {
        let departmentName = clearance.department;
        let subDepartmentName = clearance.subDepartment;
        let designationName = clearance.designation;

        // Try to resolve department name
        if (clearance.department) {
          try {
            const dept = await prisma.department.findUnique({
              where: { id: clearance.department },
              select: { name: true },
            });
            if (dept) departmentName = dept.name;
          } catch (e) {
            // Keep original value
          }
        }

        // Try to resolve sub-department name
        if (clearance.subDepartment) {
          try {
            const subDept = await prisma.subDepartment.findUnique({
              where: { id: clearance.subDepartment },
              select: { name: true },
            });
            if (subDept) subDepartmentName = subDept.name;
          } catch (e) {
            // Keep original value
          }
        }

        // Try to resolve designation name
        if (clearance.designation) {
          try {
            const desig = await prisma.designation.findUnique({
              where: { id: clearance.designation },
              select: { name: true },
            });
            if (desig) designationName = desig.name;
          } catch (e) {
            // Keep original value
          }
        }

        return {
          ...clearance,
          department: departmentName,
          subDepartment: subDepartmentName,
          designation: designationName,
        };
      })
    );
    
    res.json(resolvedClearances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exit clearances" });
  }
};

// Get exit clearance by ID
export const getExitClearanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const clearance = await prisma.exitClearance.findUnique({
      where: { id },
    });
    
    if (!clearance) {
      return res.status(404).json({ error: "Exit clearance not found" });
    }

    // Resolve names from master tables
    let departmentName = clearance.department;
    let subDepartmentName = clearance.subDepartment;
    let designationName = clearance.designation;

    // Try to resolve department name
    if (clearance.department) {
      try {
        const dept = await prisma.department.findUnique({
          where: { id: clearance.department },
          select: { name: true },
        });
        if (dept) departmentName = dept.name;
      } catch (e) {
        // Keep original value
      }
    }

    // Try to resolve sub-department name
    if (clearance.subDepartment) {
      try {
        const subDept = await prisma.subDepartment.findUnique({
          where: { id: clearance.subDepartment },
          select: { name: true },
        });
        if (subDept) subDepartmentName = subDept.name;
      } catch (e) {
        // Keep original value
      }
    }

    // Try to resolve designation name
    if (clearance.designation) {
      try {
        const desig = await prisma.designation.findUnique({
          where: { id: clearance.designation },
          select: { name: true },
        });
        if (desig) designationName = desig.name;
      } catch (e) {
        // Keep original value
      }
    }

    const resolvedClearance = {
      ...clearance,
      department: departmentName,
      subDepartment: subDepartmentName,
      designation: designationName,
    };
    
    res.json(resolvedClearance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exit clearance" });
  }
};

// Create exit clearance
export const createExitClearance = async (req, res) => {
  try {
    const {
      employeeName,
      designation,
      department,
      subDepartment,
      location,
      leavingReason,
      contractEnd,
      lastWorkingDate,
      reportingManager,
      // IT Department
      itAccessControl,
      itPasswordInactivated,
      itLaptopReturned,
      itEquipment,
      itWifiDevice,
      itMobileDevice,
      itSimCard,
      itBillsSettlement,
      // Finance Department
      financeAdvance,
      financeLoan,
      financeOtherLiabilities,
      // Admin Department
      adminVehicle,
      adminKeys,
      adminOfficeAccessories,
      adminMobilePhone,
      adminVisitingCards,
      // HR Department
      hrEobi,
      hrProvidentFund,
      hrIdCard,
      hrMedical,
      hrThumbImpression,
      hrLeavesRemaining,
      hrOtherCompensation,
      note,
      approvalStatus,
    } = req.body;

    // Validate required fields
    if (!employeeName || !lastWorkingDate) {
      return res
        .status(400)
        .json({ error: "Employee name and last working date are required" });
    }

    const clearance = await prisma.exitClearance.create({
      data: {
        employeeName,
        designation: designation || null,
        department: department || null,
        subDepartment: subDepartment || null,
        location: location || null,
        leavingReason: leavingReason || null,
        contractEnd: contractEnd ? new Date(contractEnd) : null,
        lastWorkingDate: new Date(lastWorkingDate),
        reportingManager: reportingManager || null,
        // IT Department
        itAccessControl: itAccessControl || false,
        itPasswordInactivated: itPasswordInactivated || false,
        itLaptopReturned: itLaptopReturned || false,
        itEquipment: itEquipment || false,
        itWifiDevice: itWifiDevice || false,
        itMobileDevice: itMobileDevice || false,
        itSimCard: itSimCard || false,
        itBillsSettlement: itBillsSettlement || false,
        // Finance Department
        financeAdvance: financeAdvance || false,
        financeLoan: financeLoan || false,
        financeOtherLiabilities: financeOtherLiabilities || false,
        // Admin Department
        adminVehicle: adminVehicle || false,
        adminKeys: adminKeys || false,
        adminOfficeAccessories: adminOfficeAccessories || false,
        adminMobilePhone: adminMobilePhone || false,
        adminVisitingCards: adminVisitingCards || false,
        // HR Department
        hrEobi: hrEobi || false,
        hrProvidentFund: hrProvidentFund || false,
        hrIdCard: hrIdCard || false,
        hrMedical: hrMedical || false,
        hrThumbImpression: hrThumbImpression || false,
        hrLeavesRemaining: hrLeavesRemaining || false,
        hrOtherCompensation: hrOtherCompensation || false,
        note: note || null,
        approvalStatus: approvalStatus || "pending",
      },
    });

    res.status(201).json(clearance);
  } catch (error) {
    console.error("Error creating exit clearance:", error);
    res.status(500).json({ error: "Failed to create exit clearance" });
  }
};

// Update exit clearance
export const updateExitClearance = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;

    // Remove read-only fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Convert date strings to Date objects
    if (updates.contractEnd && typeof updates.contractEnd === 'string') {
      updates.contractEnd = new Date(updates.contractEnd);
    }
    if (updates.lastWorkingDate && typeof updates.lastWorkingDate === 'string') {
      updates.lastWorkingDate = new Date(updates.lastWorkingDate);
    }
    if (updates.date && typeof updates.date === 'string') {
      updates.date = new Date(updates.date);
    }

    const clearance = await prisma.exitClearance.update({
      where: { id },
      data: updates,
    });

    res.json(clearance);
  } catch (error) {
    console.error("Error updating exit clearance:", error);
    console.error("Error details:", error.message, error.code);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Exit clearance not found" });
    }
    res.status(500).json({ 
      error: "Failed to update exit clearance",
      details: error.message 
    });
  }
};

// Delete exit clearance
export const deleteExitClearance = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.exitClearance.delete({
      where: { id },
    });

    res.json({ message: "Exit clearance deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Exit clearance not found" });
    }
    res.status(500).json({ error: "Failed to delete exit clearance" });
  }
};

// Get employee details by ID (department and sub-department)
export const getEmployeeDepartmentInfo = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        employeeId: true,
        employeeName: true,
        department: true,
        subDepartment: true,
        designation: true,
        reportingManager: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Try to resolve names from master tables
    let departmentName = employee.department;
    let subDepartmentName = employee.subDepartment;
    let designationName = employee.designation;

    // If department is an ID, fetch the name
    if (employee.department) {
      try {
        const dept = await prisma.department.findUnique({
          where: { id: employee.department },
          select: { name: true },
        });
        if (dept) departmentName = dept.name;
      } catch (e) {
        // If not found as ID, keep the original value (already a name)
      }
    }

    // If subDepartment is an ID, fetch the name
    if (employee.subDepartment) {
      try {
        const subDept = await prisma.subDepartment.findUnique({
          where: { id: employee.subDepartment },
          select: { name: true },
        });
        if (subDept) subDepartmentName = subDept.name;
      } catch (e) {
        // If not found as ID, keep the original value (already a name)
      }
    }

    // If designation is an ID, fetch the name
    if (employee.designation) {
      try {
        const desig = await prisma.designation.findUnique({
          where: { id: employee.designation },
          select: { name: true },
        });
        if (desig) designationName = desig.name;
      } catch (e) {
        // If not found as ID, keep the original value (already a name)
      }
    }

    res.json({
      ...employee,
      department: departmentName,
      subDepartment: subDepartmentName,
      designation: designationName,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee details" });
  }
};

// Get all employees list
export const getAllEmployeesForClearance = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        employeeName: true,
        department: true,
        subDepartment: true,
        designation: true,
      },
      orderBy: { employeeName: "asc" },
    });

    // Resolve names from master tables for all employees
    const resolvedEmployees = await Promise.all(
      employees.map(async (emp) => {
        let departmentName = emp.department;
        let subDepartmentName = emp.subDepartment;
        let designationName = emp.designation;

        // Try to resolve department name
        if (emp.department) {
          try {
            const dept = await prisma.department.findUnique({
              where: { id: emp.department },
              select: { name: true },
            });
            if (dept) departmentName = dept.name;
          } catch (e) {
            // Keep original value
          }
        }

        // Try to resolve sub-department name
        if (emp.subDepartment) {
          try {
            const subDept = await prisma.subDepartment.findUnique({
              where: { id: emp.subDepartment },
              select: { name: true },
            });
            if (subDept) subDepartmentName = subDept.name;
          } catch (e) {
            // Keep original value
          }
        }

        // Try to resolve designation name
        if (emp.designation) {
          try {
            const desig = await prisma.designation.findUnique({
              where: { id: emp.designation },
              select: { name: true },
            });
            if (desig) designationName = desig.name;
          } catch (e) {
            // Keep original value
          }
        }

        return {
          ...emp,
          department: departmentName,
          subDepartment: subDepartmentName,
          designation: designationName,
        };
      })
    );

    res.json(resolvedEmployees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
};
