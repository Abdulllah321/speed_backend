import prisma from '@/models/database.js';

export const getAllLeavesPolicies = async (req, res) => {
  try {
    const policies = await prisma.leavesPolicy.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        items: {
          include: {
            leaveType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    const data = policies.map(p => ({
      ...p,
      fullDayDeductionRate: Number(p.fullDayDeductionRate),
      halfDayDeductionRate: Number(p.halfDayDeductionRate),
      shortLeaveDeductionRate: Number(p.shortLeaveDeductionRate),
      createdBy: p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName || ''}`.trim() : null,
    }));
    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching leave policies:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch leave policies' });
  }
};

export const getLeavesPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await prisma.leavesPolicy.findUnique({
      where: { id },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        items: {
          include: {
            leaveType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    if (!policy) {
      return res.status(404).json({ status: false, message: 'Leave policy not found' });
    }
    res.json({
      status: true,
      data: {
        ...policy,
        fullDayDeductionRate: Number(policy.fullDayDeductionRate),
        halfDayDeductionRate: Number(policy.halfDayDeductionRate),
        shortLeaveDeductionRate: Number(policy.shortLeaveDeductionRate),
        createdBy: policy.createdBy ? `${policy.createdBy.firstName} ${policy.createdBy.lastName || ''}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching leave policy:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch leave policy' });
  }
};

export const createLeavesPolicy = async (req, res) => {
  try {
    const {
      name,
      dateFrom,
      dateTill,
      fullDayDeductionRate,
      halfDayDeductionRate,
      shortLeaveDeductionRate,
      items,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    if (!dateFrom || !dateTill) {
      return res.status(400).json({ status: false, message: 'Date from and date till are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: false, message: 'At least one leave type item is required' });
    }

    // Validate items
    const validItems = items.filter(item => item.leaveTypeId && item.quantity > 0);
    if (validItems.length === 0) {
      return res.status(400).json({ status: false, message: 'At least one valid leave type item is required' });
    }

    const policy = await prisma.leavesPolicy.create({
      data: {
        name: name.trim(),
        dateFrom: new Date(dateFrom),
        dateTill: new Date(dateTill),
        fullDayDeductionRate: parseFloat(fullDayDeductionRate) || 1.0,
        halfDayDeductionRate: parseFloat(halfDayDeductionRate) || 0.5,
        shortLeaveDeductionRate: parseFloat(shortLeaveDeductionRate) || 0.25,
        createdById: req.user?.userId || null,
        items: {
          create: validItems.map(item => ({
            leaveTypeId: item.leaveTypeId,
            quantity: parseInt(item.quantity),
          })),
        },
      },
      include: {
        items: {
          include: {
            leaveType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: true,
      data: {
        ...policy,
        fullDayDeductionRate: Number(policy.fullDayDeductionRate),
        halfDayDeductionRate: Number(policy.halfDayDeductionRate),
        shortLeaveDeductionRate: Number(policy.shortLeaveDeductionRate),
      },
      message: 'Leave policy created successfully',
    });
  } catch (error) {
    console.error('Error creating leave policy:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Leave policy with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create leave policy' });
  }
};

export const createLeavesPoliciesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one leave policy is required' });
  }
  const validItems = items.filter(i => i.name?.trim());
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid leave policy is required' });
  }
  const result = await prisma.leavesPolicy.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      details: i.details?.trim() || null,
      createdById: req.user?.userId || null,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} leave policy/policies created successfully` });
};

export const updateLeavesPolicy = async (req, res) => {
  const { id } = req.params;
  const { name, details } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const policy = await prisma.leavesPolicy.update({
    where: { id },
    data: { name: name.trim(), details: details?.trim() || null },
  });
  res.json({ status: true, data: policy, message: 'Leave policy updated successfully' });
};

export const deleteLeavesPolicy = async (req, res) => {
  const { id } = req.params;
  await prisma.leavesPolicy.delete({ where: { id } });
  res.json({ status: true, message: 'Leave policy deleted successfully' });
};

export const updateLeavesPoliciesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.leavesPolicy.update({
        where: { id: item.id },
        data: { name: item.name.trim(), details: item.details?.trim() || null },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} leave policy/policies updated successfully` });
};

export const deleteLeavesPoliciesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.leavesPolicy.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} leave policy/policies deleted successfully` });
};

