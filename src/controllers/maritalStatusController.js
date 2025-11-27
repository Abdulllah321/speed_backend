import prisma from '@/models/database.js';

// MaritalStatus CRUD
export const getAllMaritalStatuses = async (req, res) => {
  const maritalStatuses = await prisma.maritalStatus.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = maritalStatuses.map(m => ({
    ...m,
    createdBy: m.createdBy ? `${m.createdBy.firstName} ${m.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getMaritalStatusById = async (req, res) => {
  const { id } = req.params;
  const maritalStatus = await prisma.maritalStatus.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!maritalStatus) {
    return res.status(404).json({ status: false, message: 'Marital status not found' });
  }
  res.json({
    status: true,
    data: {
      ...maritalStatus,
      createdBy: maritalStatus.createdBy ? `${maritalStatus.createdBy.firstName} ${maritalStatus.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createMaritalStatus = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const maritalStatus = await prisma.maritalStatus.create({
    data: { name: name.trim(), createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: maritalStatus, message: 'Marital status created successfully' });
};

export const createMaritalStatusesBulk = async (req, res) => {
  const { names } = req.body;
  if (!names?.length) {
    return res.status(400).json({ status: false, message: 'At least one name is required' });
  }
  const validNames = names.map(n => n?.trim()).filter(Boolean);
  if (!validNames.length) {
    return res.status(400).json({ status: false, message: 'At least one valid name is required' });
  }
  const result = await prisma.maritalStatus.createMany({
    data: validNames.map(name => ({ name, createdById: req.user?.userId || null })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} marital status(es) created successfully` });
};

export const updateMaritalStatus = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const maritalStatus = await prisma.maritalStatus.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: maritalStatus, message: 'Marital status updated successfully' });
};

export const deleteMaritalStatus = async (req, res) => {
  const { id } = req.params;
  await prisma.maritalStatus.delete({ where: { id } });
  res.json({ status: true, message: 'Marital status deleted successfully' });
};

export const updateMaritalStatusesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.maritalStatus.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} marital status(es) updated successfully` });
};

export const deleteMaritalStatusesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.maritalStatus.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} marital status(es) deleted successfully` });
};

