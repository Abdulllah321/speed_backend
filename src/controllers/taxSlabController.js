import prisma from '@/models/database.js';

export const getAllTaxSlabs = async (req, res) => {
  const taxSlabs = await prisma.taxSlab.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = taxSlabs.map(t => ({
    ...t,
    minAmount: Number(t.minAmount),
    maxAmount: Number(t.maxAmount),
    rate: Number(t.rate),
    createdBy: t.createdBy ? `${t.createdBy.firstName} ${t.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getTaxSlabById = async (req, res) => {
  const { id } = req.params;
  const taxSlab = await prisma.taxSlab.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!taxSlab) {
    return res.status(404).json({ status: false, message: 'Tax slab not found' });
  }
  res.json({
    status: true,
    data: {
      ...taxSlab,
      minAmount: Number(taxSlab.minAmount),
      maxAmount: Number(taxSlab.maxAmount),
      rate: Number(taxSlab.rate),
      createdBy: taxSlab.createdBy ? `${taxSlab.createdBy.firstName} ${taxSlab.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createTaxSlab = async (req, res) => {
  const { name, minAmount, maxAmount, rate } = req.body;
  if (!name?.trim() || minAmount === undefined || maxAmount === undefined || rate === undefined) {
    return res.status(400).json({ status: false, message: 'Name, minAmount, maxAmount and rate are required' });
  }
  const taxSlab = await prisma.taxSlab.create({
    data: { name: name.trim(), minAmount, maxAmount, rate, createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: taxSlab, message: 'Tax slab created successfully' });
};

export const createTaxSlabsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one tax slab is required' });
  }
  const validItems = items.filter(i => i.name?.trim() && i.minAmount !== undefined && i.maxAmount !== undefined && i.rate !== undefined);
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid tax slab is required' });
  }
  const result = await prisma.taxSlab.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      minAmount: i.minAmount,
      maxAmount: i.maxAmount,
      rate: i.rate,
      createdById: req.user?.userId || null,
    })),
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} tax slab(s) created successfully` });
};

export const updateTaxSlab = async (req, res) => {
  const { id } = req.params;
  const { name, minAmount, maxAmount, rate } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const taxSlab = await prisma.taxSlab.update({
    where: { id },
    data: { name: name.trim(), minAmount, maxAmount, rate },
  });
  res.json({ status: true, data: taxSlab, message: 'Tax slab updated successfully' });
};

export const deleteTaxSlab = async (req, res) => {
  const { id } = req.params;
  await prisma.taxSlab.delete({ where: { id } });
  res.json({ status: true, message: 'Tax slab deleted successfully' });
};

export const updateTaxSlabsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.taxSlab.update({
        where: { id: item.id },
        data: { name: item.name.trim(), minAmount: item.minAmount, maxAmount: item.maxAmount, rate: item.rate },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} tax slab(s) updated successfully` });
};

export const deleteTaxSlabsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.taxSlab.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} tax slab(s) deleted successfully` });
};

