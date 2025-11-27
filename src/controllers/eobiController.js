import prisma from '@/models/database.js';

export const getAllEOBIs = async (req, res) => {
  const eobis = await prisma.eOBI.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = eobis.map(e => ({
    ...e,
    amount: Number(e.amount),
    createdBy: e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getEOBIById = async (req, res) => {
  const { id } = req.params;
  const eobi = await prisma.eOBI.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!eobi) {
    return res.status(404).json({ status: false, message: 'EOBI not found' });
  }
  res.json({
    status: true,
    data: {
      ...eobi,
      amount: Number(eobi.amount),
      createdBy: eobi.createdBy ? `${eobi.createdBy.firstName} ${eobi.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createEOBI = async (req, res) => {
  const { name, amount, yearMonth } = req.body;
  if (!name?.trim() || amount === undefined || !yearMonth?.trim()) {
    return res.status(400).json({ status: false, message: 'Name, amount and yearMonth are required' });
  }
  const eobi = await prisma.eOBI.create({
    data: { name: name.trim(), amount, yearMonth: yearMonth.trim(), createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: eobi, message: 'EOBI created successfully' });
};

export const createEOBIsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one EOBI is required' });
  }
  const validItems = items.filter(i => i.name?.trim() && i.amount !== undefined && i.yearMonth?.trim());
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid EOBI is required' });
  }
  const result = await prisma.eOBI.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      amount: i.amount,
      yearMonth: i.yearMonth.trim(),
      createdById: req.user?.userId || null,
    })),
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} EOBI(s) created successfully` });
};

export const updateEOBI = async (req, res) => {
  const { id } = req.params;
  const { name, amount, yearMonth } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const eobi = await prisma.eOBI.update({
    where: { id },
    data: { name: name.trim(), amount, yearMonth: yearMonth?.trim() },
  });
  res.json({ status: true, data: eobi, message: 'EOBI updated successfully' });
};

export const deleteEOBI = async (req, res) => {
  const { id } = req.params;
  await prisma.eOBI.delete({ where: { id } });
  res.json({ status: true, message: 'EOBI deleted successfully' });
};

export const updateEOBIsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.eOBI.update({
        where: { id: item.id },
        data: { name: item.name.trim(), amount: item.amount, yearMonth: item.yearMonth?.trim() },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} EOBI(s) updated successfully` });
};

export const deleteEOBIsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.eOBI.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} EOBI(s) deleted successfully` });
};

