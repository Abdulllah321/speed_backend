import prisma from '@/models/database.js';

// ProvidentFund CRUD
export const getAllProvidentFunds = async (req, res) => {
  try {
    const providentFunds = await prisma.providentFund.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    const data = providentFunds.map(pf => ({
      ...pf,
      percentage: Number(pf.percentage),
      createdBy: pf.createdBy ? `${pf.createdBy.firstName} ${pf.createdBy.lastName || ''}`.trim() : null,
    }));
    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching provident funds:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch provident funds' });
  }
};

export const getProvidentFundById = async (req, res) => {
  try {
    const { id } = req.params;
    const providentFund = await prisma.providentFund.findUnique({
      where: { id },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!providentFund) {
      return res.status(404).json({ status: false, message: 'Provident fund not found' });
    }
    res.json({
      status: true,
      data: {
        ...providentFund,
        percentage: Number(providentFund.percentage),
        createdBy: providentFund.createdBy ? `${providentFund.createdBy.firstName} ${providentFund.createdBy.lastName || ''}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching provident fund:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch provident fund' });
  }
};

export const createProvidentFund = async (req, res) => {
  try {
    const { name, percentage, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return res.status(400).json({ status: false, message: 'Percentage is required and must be a number' });
    }
    const providentFund = await prisma.providentFund.create({
      data: { 
        name: name.trim(), 
        percentage: percentage,
        status: status || 'active',
        createdById: req.user?.userId || null 
      },
    });
    res.status(201).json({ status: true, data: providentFund, message: 'Provident fund created successfully' });
  } catch (error) {
    console.error('Error creating provident fund:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Provident fund with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create provident fund' });
  }
};

export const createProvidentFundsBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one provident fund is required' });
    }
    const validItems = items.filter(i => i.name?.trim() && i.percentage !== undefined && i.percentage !== null && !isNaN(i.percentage));
    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid provident fund is required' });
    }
    const result = await prisma.providentFund.createMany({
      data: validItems.map(i => ({
        name: i.name.trim(),
        percentage: i.percentage,
        status: i.status || 'active',
        createdById: req.user?.userId || null,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ status: true, data: result, message: `${result.count} provident fund(s) created successfully` });
  } catch (error) {
    console.error('Error creating provident funds bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create provident funds' });
  }
};

export const updateProvidentFund = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    if (percentage !== undefined && (percentage === null || isNaN(percentage))) {
      return res.status(400).json({ status: false, message: 'Percentage must be a valid number' });
    }
    const providentFund = await prisma.providentFund.update({
      where: { id },
      data: { 
        name: name.trim(),
        percentage: percentage !== undefined ? percentage : undefined,
        status: status || undefined,
      },
    });
    res.json({ status: true, data: providentFund, message: 'Provident fund updated successfully' });
  } catch (error) {
    console.error('Error updating provident fund:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Provident fund with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update provident fund' });
  }
};

export const deleteProvidentFund = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.providentFund.delete({ where: { id } });
    res.json({ status: true, message: 'Provident fund deleted successfully' });
  } catch (error) {
    console.error('Error deleting provident fund:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete provident fund' });
  }
};

export const updateProvidentFundsBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one item is required' });
    }
    const results = await Promise.all(
      items.map(async (item) => {
        if (!item.id || !item.name?.trim() || item.percentage === undefined || isNaN(item.percentage)) return null;
        return prisma.providentFund.update({
          where: { id: item.id },
          data: { 
            name: item.name.trim(),
            percentage: item.percentage,
            status: item.status || undefined,
          },
        });
      })
    );
    const updated = results.filter(Boolean);
    res.json({ status: true, message: `${updated.length} provident fund(s) updated successfully` });
  } catch (error) {
    console.error('Error updating provident funds bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to update provident funds' });
  }
};

export const deleteProvidentFundsBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res.status(400).json({ status: false, message: 'At least one id is required' });
    }
    const result = await prisma.providentFund.deleteMany({ where: { id: { in: ids } } });
    res.json({ status: true, message: `${result.count} provident fund(s) deleted successfully` });
  } catch (error) {
    console.error('Error deleting provident funds bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete provident funds' });
  }
};

