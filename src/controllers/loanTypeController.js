import prisma from '@/models/database.js';

export const getAllLoanTypes = async (req, res) => {
  const loanTypes = await prisma.loanType.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = loanTypes.map(lt => ({
    ...lt,
    createdBy: lt.createdBy ? `${lt.createdBy.firstName} ${lt.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getLoanTypeById = async (req, res) => {
  const { id } = req.params;
  const loanType = await prisma.loanType.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!loanType) {
    return res.status(404).json({ status: false, message: 'Loan type not found' });
  }
  res.json({
    status: true,
    data: {
      ...loanType,
      createdBy: loanType.createdBy ? `${loanType.createdBy.firstName} ${loanType.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createLoanType = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const loanType = await prisma.loanType.create({
    data: { name: name.trim(), createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: loanType, message: 'Loan type created successfully' });
};

export const createLoanTypesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one loan type is required' });
  }
  const validItems = items.filter(i => i.name?.trim());
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid loan type is required' });
  }
  const result = await prisma.loanType.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      createdById: req.user?.userId || null,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} loan type(s) created successfully` });
};

export const updateLoanType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const loanType = await prisma.loanType.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: loanType, message: 'Loan type updated successfully' });
};

export const deleteLoanType = async (req, res) => {
  const { id } = req.params;
  await prisma.loanType.delete({ where: { id } });
  res.json({ status: true, message: 'Loan type deleted successfully' });
};

export const updateLoanTypesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.loanType.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} loan type(s) updated successfully` });
};

export const deleteLoanTypesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.loanType.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} loan type(s) deleted successfully` });
};

