import prisma from '@/models/database.js';
import activityLogService from '@/services/activityLogService.js';
import { logActivity } from '@/util/activityLogHelper.js';

// Designation CRUD
export const getAllDesignations = async (req, res) => {
  const designations = await prisma.designation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
  res.json({ status: true, data: designations });
};

export const getDesignationById = async (req, res) => {
  const { id } = req.params;
  const designation = await prisma.designation.findUnique({
    where: { id },
  });

  if (!designation) {
    return res.status(404).json({ status: false, message: 'Designation not found' });
  }
  res.json({ status: true, data: designation });
};

export const createDesignation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }

    const designation = await prisma.designation.create({
      data: { name: name.trim(), createdById: req.user.userId },
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create',
      module: 'designations',
      entity: 'Designation',
      entityId: designation.id,
      description: `Created designation: ${designation.name}`,
      newValues: { name: designation.name },
      req,
    });
    
    res.status(201).json({ status: true, data: designation, message: 'Designation created successfully' });
  } catch (error) {
    console.error('Create designation error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'create',
      module: 'designations',
      entity: 'Designation',
      description: 'Failed to create designation',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to create designation' });
  }
};

export const createDesignationsBulk = async (req, res) => {
  const { names } = req.body;
  if (!names?.length) {
    return res.status(400).json({ status: false, message: 'At least one name is required' });
  }
  const validNames = names.map(n => n?.trim()).filter(Boolean);
  if (!validNames.length) {
    return res.status(400).json({ status: false, message: 'At least one valid name is required' });
  }

  const result = await prisma.designation.createMany({
    data: validNames.map(name => ({ name, createdById: req.user.userId })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} designation(s) created successfully` });
};

export const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    
    const oldDesignation = await prisma.designation.findUnique({ where: { id } });
    if (!oldDesignation) {
      return res.status(404).json({ status: false, message: 'Designation not found' });
    }
    
    const designation = await prisma.designation.update({
      where: { id },
      data: { name: name.trim() },
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'update',
      module: 'designations',
      entity: 'Designation',
      entityId: designation.id,
      description: `Updated designation: ${designation.name}`,
      oldValues: { name: oldDesignation.name },
      newValues: { name: designation.name },
      req,
    });
    
    res.json({ status: true, data: designation, message: 'Designation updated successfully' });
  } catch (error) {
    console.error('Update designation error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'update',
      module: 'designations',
      entity: 'Designation',
      entityId: req.params.id,
      description: 'Failed to update designation',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to update designation' });
  }
};

export const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const designation = await prisma.designation.findUnique({ where: { id } });
    if (!designation) {
      return res.status(404).json({ status: false, message: 'Designation not found' });
    }
    
    await prisma.designation.delete({
      where: { id },
    });
    
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'delete',
      module: 'designations',
      entity: 'Designation',
      entityId: id,
      description: `Deleted designation: ${designation.name}`,
      oldValues: { name: designation.name },
      req,
    });
    
    res.json({ status: true, message: 'Designation deleted successfully' });
  } catch (error) {
    console.error('Delete designation error:', error);
    await logActivity(activityLogService, {
      userId: req.user?.userId || null,
      action: 'delete',
      module: 'designations',
      entity: 'Designation',
      entityId: req.params.id,
      description: 'Failed to delete designation',
      req,
      status: 'failure',
      errorMessage: error.message,
    });
    res.status(500).json({ status: false, message: 'Failed to delete designation' });
  }
};

export const updateDesignationsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }

  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.designation.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );

  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} designation(s) updated successfully` });
};

export const deleteDesignationsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }

  const result = await prisma.designation.deleteMany({
    where: { id: { in: ids } },
  });

  res.json({ status: true, message: `${result.count} designation(s) deleted successfully` });
};

