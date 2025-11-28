import prisma from '@/models/database.js';

export const getAllLeaveTypes = async (req, res) => {
  const leaveTypes = await prisma.leaveType.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = leaveTypes.map(lt => ({
    ...lt,
    createdBy: lt.createdBy ? `${lt.createdBy.firstName} ${lt.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getLeaveTypeById = async (req, res) => {
  const { id } = req.params;
  const leaveType = await prisma.leaveType.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!leaveType) {
    return res.status(404).json({ status: false, message: 'Leave type not found' });
  }
  res.json({
    status: true,
    data: {
      ...leaveType,
      createdBy: leaveType.createdBy ? `${leaveType.createdBy.firstName} ${leaveType.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createLeaveType = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const leaveType = await prisma.leaveType.create({
    data: { name: name.trim(), createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: leaveType, message: 'Leave type created successfully' });
};

export const createLeaveTypesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one leave type is required' });
  }
  const validItems = items.filter(i => i.name?.trim());
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid leave type is required' });
  }
  const result = await prisma.leaveType.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      createdById: req.user?.userId || null,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} leave type(s) created successfully` });
};

export const updateLeaveType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const leaveType = await prisma.leaveType.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: leaveType, message: 'Leave type updated successfully' });
};

export const deleteLeaveType = async (req, res) => {
  const { id } = req.params;
  await prisma.leaveType.delete({ where: { id } });
  res.json({ status: true, message: 'Leave type deleted successfully' });
};

export const updateLeaveTypesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.leaveType.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} leave type(s) updated successfully` });
};

export const deleteLeaveTypesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.leaveType.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} leave type(s) deleted successfully` });
};

