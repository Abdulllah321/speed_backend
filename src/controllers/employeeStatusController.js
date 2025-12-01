import prisma from '@/models/database.js';

// EmployeeStatus CRUD
export const getAllEmployeeStatuses = async (req, res) => {
  try {
    const employeeStatuses = await prisma.employeeStatus.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    const data = employeeStatuses.map(es => ({
      ...es,
      createdBy: es.createdBy ? `${es.createdBy.firstName} ${es.createdBy.lastName || ''}`.trim() : null,
    }));
    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching employee statuses:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch employee statuses' });
  }
};

export const getEmployeeStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeStatus = await prisma.employeeStatus.findUnique({
      where: { id },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!employeeStatus) {
      return res.status(404).json({ status: false, message: 'Employee status not found' });
    }
    res.json({
      status: true,
      data: {
        ...employeeStatus,
        createdBy: employeeStatus.createdBy ? `${employeeStatus.createdBy.firstName} ${employeeStatus.createdBy.lastName || ''}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching employee status:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch employee status' });
  }
};

export const createEmployeeStatus = async (req, res) => {
  try {
    const { status, statusType } = req.body;
    if (!status?.trim()) {
      return res.status(400).json({ status: false, message: 'Status is required' });
    }
    const employeeStatus = await prisma.employeeStatus.create({
      data: { 
        status: status.trim(), 
        statusType: statusType || 'active',
        createdById: req.user?.userId || null 
      },
    });
    res.status(201).json({ status: true, data: employeeStatus, message: 'Employee status created successfully' });
  } catch (error) {
    console.error('Error creating employee status:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Employee status with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create employee status' });
  }
};

export const createEmployeeStatusesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one employee status is required' });
    }
    const validItems = items.filter(i => i.status?.trim());
    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid employee status is required' });
    }
    const result = await prisma.employeeStatus.createMany({
      data: validItems.map(i => ({
        status: i.status.trim(),
        statusType: i.statusType || 'active',
        createdById: req.user?.userId || null,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ status: true, data: result, message: `${result.count} employee status(es) created successfully` });
  } catch (error) {
    console.error('Error creating employee statuses bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create employee statuses' });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusType } = req.body;
    if (!status?.trim()) {
      return res.status(400).json({ status: false, message: 'Status is required' });
    }
    const employeeStatus = await prisma.employeeStatus.update({
      where: { id },
      data: { 
        status: status.trim(),
        statusType: statusType || undefined,
      },
    });
    res.json({ status: true, data: employeeStatus, message: 'Employee status updated successfully' });
  } catch (error) {
    console.error('Error updating employee status:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Employee status with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update employee status' });
  }
};

export const deleteEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.employeeStatus.delete({ where: { id } });
    res.json({ status: true, message: 'Employee status deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee status:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete employee status' });
  }
};

export const updateEmployeeStatusesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one item is required' });
    }
    const results = await Promise.all(
      items.map(async (item) => {
        if (!item.id || !item.status?.trim()) return null;
        return prisma.employeeStatus.update({
          where: { id: item.id },
          data: { 
            status: item.status.trim(),
            statusType: item.statusType || undefined,
          },
        });
      })
    );
    const updated = results.filter(Boolean);
    res.json({ status: true, message: `${updated.length} employee status(es) updated successfully` });
  } catch (error) {
    console.error('Error updating employee statuses bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to update employee statuses' });
  }
};

export const deleteEmployeeStatusesBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res.status(400).json({ status: false, message: 'At least one id is required' });
    }
    const result = await prisma.employeeStatus.deleteMany({ where: { id: { in: ids } } });
    res.json({ status: true, message: `${result.count} employee status(es) deleted successfully` });
  } catch (error) {
    console.error('Error deleting employee statuses bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete employee statuses' });
  }
};

