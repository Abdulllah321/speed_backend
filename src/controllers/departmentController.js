import prisma from '@/models/database.js';
import activityLogService from '@/services/activityLogService.js';
import { logActivity } from '@/util/activityLogHelper.js';

// Department CRUD
export const getAllDepartments = async (req, res) => {
  const departments = await prisma.department.findMany({
    include: { 
      subDepartments: true,
      createdBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = departments.map((dept) => ({
    ...dept,
    createdBy: dept.createdBy ? `${dept.createdBy.firstName} ${dept.createdBy.lastName || ''}`.trim() : null,
  }));

  res.json({ status: true, data });
};

export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  const department = await prisma.department.findUnique({
    where: { id },
    include: { 
      subDepartments: true,
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });
  if (!department) {
    return res.status(404).json({ status: false, message: 'Department not found' });
  }
  const data = {
    ...department,
    createdBy: department.createdBy ? `${department.createdBy.firstName} ${department.createdBy.lastName || ''}`.trim() : null,
  };
  res.json({ status: true, data });
};

export const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    const department = await prisma.department.create({
      data: { name: name.trim(), createdById: req.user?.userId || null },
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create',
      module: 'departments',
      entity: 'Department',
      entityId: department.id,
      description: `Created department: ${department.name}`,
      newValues: { name: department.name },
      req,
    });
    
    res.status(201).json({ status: true, data: department, message: 'Department created successfully' });
  } catch (error) {
    console.error('Create department error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create',
      module: 'departments',
      entity: 'Department',
      description: 'Failed to create department',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to create department' });
  }
};

export const createDepartmentsBulk = async (req, res) => {
  try {
    const { names } = req.body;
    if (!names?.length) {
      return res.status(400).json({ status: false, message: 'At least one name is required' });
    }
    const validNames = names.map(n => n?.trim()).filter(Boolean);
    if (!validNames.length) {
      return res.status(400).json({ status: false, message: 'At least one valid name is required' });
    }
    const result = await prisma.department.createMany({
      data: validNames.map(name => ({ name, createdById: req.user?.userId || null })),
      skipDuplicates: true,
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create_bulk',
      module: 'departments',
      entity: 'Department',
      description: `Bulk created ${result.count} department(s)`,
      newValues: { count: result.count, names: validNames },
      req,
    });
    
    res.status(201).json({ status: true, data: result, message: `${result.count} department(s) created successfully` });
  } catch (error) {
    console.error('Bulk create departments error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create_bulk',
      module: 'departments',
      entity: 'Department',
      description: 'Failed to bulk create departments',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to create departments' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    
    const oldDepartment = await prisma.department.findUnique({ where: { id } });
    if (!oldDepartment) {
      return res.status(404).json({ status: false, message: 'Department not found' });
    }
    
    const department = await prisma.department.update({
      where: { id },
      data: { name: name.trim() },
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'update',
      module: 'departments',
      entity: 'Department',
      entityId: department.id,
      description: `Updated department: ${department.name}`,
      oldValues: { name: oldDepartment.name },
      newValues: { name: department.name },
      req,
    });
    
    res.json({ status: true, data: department, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'update',
      module: 'departments',
      entity: 'Department',
      entityId: req.params.id,
      description: 'Failed to update department',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to update department' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      return res.status(404).json({ status: false, message: 'Department not found' });
    }
    
    await prisma.department.delete({
      where: { id },
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'delete',
      module: 'departments',
      entity: 'Department',
      entityId: id,
      description: `Deleted department: ${department.name}`,
      oldValues: { name: department.name },
      req,
    });
    
    res.json({ status: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'delete',
      module: 'departments',
      entity: 'Department',
      entityId: req.params.id,
      description: 'Failed to delete department',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to delete department' });
  }
};

export const updateDepartmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }

  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.department.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );

  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} department(s) updated successfully` });
};

export const deleteDepartmentsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }

  const result = await prisma.department.deleteMany({
    where: { id: { in: ids } },
  });

  res.json({ status: true, message: `${result.count} department(s) deleted successfully` });
};

// Sub-Department CRUD
export const getAllSubDepartments = async (req, res) => {
  const subDepartments = await prisma.subDepartment.findMany({
    include: { 
      department: true,
      createdBy: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' },
  });
  const data = subDepartments.map(sd => ({
    ...sd,
    departmentName: sd.department.name,
    createdBy: sd.createdBy ? `${sd.createdBy.firstName} ${sd.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getSubDepartmentsByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const subDepartments = await prisma.subDepartment.findMany({
    where: { departmentId },
    include: { 
      department: true,
      createdBy: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' },
  });
  const data = subDepartments.map(sd => ({
    ...sd,
    departmentName: sd.department.name,
    createdBy: sd.createdBy ? `${sd.createdBy.firstName} ${sd.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const createSubDepartment = async (req, res) => {
  const { name, departmentId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  if (!departmentId) {
    return res.status(400).json({ status: false, message: 'Department is required' });
  }
  const subDepartment = await prisma.subDepartment.create({
    data: { 
      name: name.trim(), 
      departmentId,
      createdById: req.user?.userId || null
    },
    include: { 
      department: true,
      createdBy: { select: { firstName: true, lastName: true } }
    },
  });
  const data = {
    ...subDepartment,
    departmentName: subDepartment.department.name,
    createdBy: subDepartment.createdBy ? `${subDepartment.createdBy.firstName} ${subDepartment.createdBy.lastName || ''}`.trim() : null,
  };
  res.status(201).json({ status: true, data, message: 'Sub-department created successfully' });
};

export const createSubDepartmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one sub-department is required' });
  }
  const validItems = items.filter(i => i.name?.trim() && i.departmentId);
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid sub-department is required' });
  }
  const result = await prisma.subDepartment.createMany({
    data: validItems.map(i => ({ name: i.name.trim(), departmentId: i.departmentId, createdById: req.user?.userId || null })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} sub-department(s) created successfully` });
};

export const updateSubDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, departmentId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const data = { name: name.trim() };
  if (departmentId) {
    data.departmentId = departmentId;
  }
  const subDepartment = await prisma.subDepartment.update({
    where: { id },
    data,
    include: { 
      department: true,
      createdBy: { select: { firstName: true, lastName: true } }
    },
  });
  const responseData = {
    ...subDepartment,
    departmentName: subDepartment.department.name,
    createdBy: subDepartment.createdBy ? `${subDepartment.createdBy.firstName} ${subDepartment.createdBy.lastName || ''}`.trim() : null,
  };
  res.json({ status: true, data: responseData, message: 'Sub-department updated successfully' });
};

export const deleteSubDepartment = async (req, res) => {
  const { id } = req.params;
  await prisma.subDepartment.delete({
    where: { id },
  });
  res.json({ status: true, message: 'Sub-department deleted successfully' });
};

export const updateSubDepartmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }

  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.subDepartment.update({
        where: { id: item.id },
        data: {
          name: item.name.trim(),
          ...(item.departmentId && { departmentId: item.departmentId }),
        },
      });
    })
  );

  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} sub-department(s) updated successfully` });
};

export const deleteSubDepartmentsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }

  const result = await prisma.subDepartment.deleteMany({
    where: { id: { in: ids } },
  });

  res.json({ status: true, message: `${result.count} sub-department(s) deleted successfully` });
};

