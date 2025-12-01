import prisma from '@/models/database.js';

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
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }

  const designation = await prisma.designation.create({
    data: { name: name.trim(), createdById: req.user.userId },
  });
  res.status(201).json({ status: true, data: designation, message: 'Designation created successfully' });
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
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const designation = await prisma.designation.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: designation, message: 'Designation updated successfully' });
};

export const deleteDesignation = async (req, res) => {
  const { id } = req.params;
  await prisma.designation.delete({
    where: { id },
  });
  res.json({ status: true, message: 'Designation deleted successfully' });
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

