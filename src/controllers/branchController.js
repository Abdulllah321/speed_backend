import prisma from '@/models/database.js';

// Branch CRUD
export const getAllBranches = async (req, res) => {
  const branches = await prisma.branch.findMany({
    include: { city: { include: { country: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: true, data: branches });
};

export const getBranchById = async (req, res) => {
  const { id } = req.params;
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: { city: { include: { country: true } } },
  });
  if (!branch) {
    return res.status(404).json({ status: false, message: 'Branch not found' });
  }
  res.json({ status: true, data: branch });
};

export const createBranch = async (req, res) => {
  try {
    const { name, address, cityId, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
  
    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        cityId: cityId || null,
        status: status || 'active',
        createdById: req.user?.userId || null,
      },
      include: { city: { include: { country: true } } },
    });
    res.status(201).json({ status: true, data: branch, message: 'Branch created successfully' });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create branch' });
  }
};

export const createBranchesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one branch is required' });
    }
    const validItems = items.filter(i => i.name?.trim());
    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid branch is required' });
    }
    const result = await prisma.branch.createMany({
      data: validItems.map(i => ({
        name: i.name.trim(),
        address: i.address?.trim() || null,
        cityId: i.cityId || null,
        status: i.status || 'active',
        createdById: req.user?.userId || null,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ status: true, data: result, message: `${result.count} branch(es) created successfully` });
  } catch (error) {
    console.error('Error creating branches bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create branches' });
  }
};

export const updateBranch = async (req, res) => {
  const { id } = req.params;
  const { name, address, cityId, status } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const branch = await prisma.branch.update({
    where: { id },
    data: {
      name: name.trim(),
      address: address?.trim() || null,
      cityId: cityId || null,
      status: status || 'active',
    },
    include: { city: { include: { country: true } } },
  });
  res.json({ status: true, data: branch, message: 'Branch updated successfully' });
};

export const updateBranchesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.branch.update({
        where: { id: item.id },
        data: {
          name: item.name.trim(),
          address: item.address?.trim() || null,
          cityId: item.cityId || null,
          status: item.status || undefined,
        },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} branch(es) updated successfully` });
};

export const deleteBranch = async (req, res) => {
  const { id } = req.params;
  await prisma.branch.delete({ where: { id } });
  res.json({ status: true, message: 'Branch deleted successfully' });
};

export const deleteBranchesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.branch.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} branch(es) deleted successfully` });
};

