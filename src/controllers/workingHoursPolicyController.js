import prisma from '@/models/database.js';

// WorkingHoursPolicy CRUD
export const getAllWorkingHoursPolicies = async (req, res) => {
  try {
    const policies = await prisma.workingHoursPolicy.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    const data = policies.map(p => ({
      ...p,
      shortDayMins: p.shortDayMins ? Number(p.shortDayMins) : null,
      lateDeductionPercent: p.lateDeductionPercent ? Number(p.lateDeductionPercent) : null,
      halfDayDeductionAmount: p.halfDayDeductionAmount ? Number(p.halfDayDeductionAmount) : null,
      shortDayDeductionAmount: p.shortDayDeductionAmount ? Number(p.shortDayDeductionAmount) : null,
      overtimeRate: p.overtimeRate ? Number(p.overtimeRate) : null,
      gazzetedOvertimeRate: p.gazzetedOvertimeRate ? Number(p.gazzetedOvertimeRate) : null,
      createdBy: p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName || ''}`.trim() : null,
    }));
    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching working hours policies:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch working hours policies' });
  }
};

export const getWorkingHoursPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await prisma.workingHoursPolicy.findUnique({
      where: { id },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!policy) {
      return res.status(404).json({ status: false, message: 'Working hours policy not found' });
    }
    res.json({
      status: true,
      data: {
        ...policy,
        shortDayMins: policy.shortDayMins ? Number(policy.shortDayMins) : null,
        lateDeductionPercent: policy.lateDeductionPercent ? Number(policy.lateDeductionPercent) : null,
        halfDayDeductionAmount: policy.halfDayDeductionAmount ? Number(policy.halfDayDeductionAmount) : null,
        shortDayDeductionAmount: policy.shortDayDeductionAmount ? Number(policy.shortDayDeductionAmount) : null,
        overtimeRate: policy.overtimeRate ? Number(policy.overtimeRate) : null,
        gazzetedOvertimeRate: policy.gazzetedOvertimeRate ? Number(policy.gazzetedOvertimeRate) : null,
        createdBy: policy.createdBy ? `${policy.createdBy.firstName} ${policy.createdBy.lastName || ''}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching working hours policy:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch working hours policy' });
  }
};

export const createWorkingHoursPolicy = async (req, res) => {
  try {
    const {
      name,
      startWorkingHours,
      endWorkingHours,
      shortDayMins,
      startBreakTime,
      endBreakTime,
      halfDayStartTime,
      lateStartTime,
      lateDeductionType,
      applyDeductionAfterLates,
      lateDeductionPercent,
      halfDayDeductionType,
      applyDeductionAfterHalfDays,
      halfDayDeductionAmount,
      shortDayDeductionType,
      applyDeductionAfterShortDays,
      shortDayDeductionAmount,
      overtimeRate,
      gazzetedOvertimeRate,
      status,
    } = req.body;

    if (!name?.trim() || !startWorkingHours || !endWorkingHours) {
      return res.status(400).json({ status: false, message: 'Name, start time, and end time are required' });
    }

    const policy = await prisma.workingHoursPolicy.create({
      data: {
        name: name.trim(),
        startWorkingHours,
        endWorkingHours,
        shortDayMins: shortDayMins ? parseInt(shortDayMins) : null,
        startBreakTime: startBreakTime || null,
        endBreakTime: endBreakTime || null,
        halfDayStartTime: halfDayStartTime || null,
        lateStartTime: lateStartTime || null,
        lateDeductionType: lateDeductionType || null,
        applyDeductionAfterLates: applyDeductionAfterLates ? parseInt(applyDeductionAfterLates) : null,
        lateDeductionPercent: lateDeductionPercent ? parseFloat(lateDeductionPercent) : null,
        halfDayDeductionType: halfDayDeductionType || null,
        applyDeductionAfterHalfDays: applyDeductionAfterHalfDays ? parseInt(applyDeductionAfterHalfDays) : null,
        halfDayDeductionAmount: halfDayDeductionAmount ? parseFloat(halfDayDeductionAmount) : null,
        shortDayDeductionType: shortDayDeductionType || null,
        applyDeductionAfterShortDays: applyDeductionAfterShortDays ? parseInt(applyDeductionAfterShortDays) : null,
        shortDayDeductionAmount: shortDayDeductionAmount ? parseFloat(shortDayDeductionAmount) : null,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : null,
        gazzetedOvertimeRate: gazzetedOvertimeRate ? parseFloat(gazzetedOvertimeRate) : null,
        status: status || 'active',
        createdById: req.user?.userId || null,
      },
    });
    res.status(201).json({ status: true, data: policy, message: 'Working hours policy created successfully' });
  } catch (error) {
    console.error('Error creating working hours policy:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Working hours policy with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create working hours policy' });
  }
};

export const updateWorkingHoursPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      startWorkingHours,
      endWorkingHours,
      shortDayMins,
      startBreakTime,
      endBreakTime,
      halfDayStartTime,
      lateStartTime,
      lateDeductionType,
      applyDeductionAfterLates,
      lateDeductionPercent,
      halfDayDeductionType,
      applyDeductionAfterHalfDays,
      halfDayDeductionAmount,
      shortDayDeductionType,
      applyDeductionAfterShortDays,
      shortDayDeductionAmount,
      overtimeRate,
      gazzetedOvertimeRate,
      status,
    } = req.body;

    if (!name?.trim() || !startWorkingHours || !endWorkingHours) {
      return res.status(400).json({ status: false, message: 'Name, start time, and end time are required' });
    }

    const policy = await prisma.workingHoursPolicy.update({
      where: { id },
      data: {
        name: name.trim(),
        startWorkingHours,
        endWorkingHours,
        shortDayMins: shortDayMins !== undefined ? (shortDayMins ? parseInt(shortDayMins) : null) : undefined,
        startBreakTime: startBreakTime !== undefined ? (startBreakTime || null) : undefined,
        endBreakTime: endBreakTime !== undefined ? (endBreakTime || null) : undefined,
        halfDayStartTime: halfDayStartTime !== undefined ? (halfDayStartTime || null) : undefined,
        lateStartTime: lateStartTime !== undefined ? (lateStartTime || null) : undefined,
        lateDeductionType: lateDeductionType !== undefined ? (lateDeductionType || null) : undefined,
        applyDeductionAfterLates: applyDeductionAfterLates !== undefined ? (applyDeductionAfterLates ? parseInt(applyDeductionAfterLates) : null) : undefined,
        lateDeductionPercent: lateDeductionPercent !== undefined ? (lateDeductionPercent ? parseFloat(lateDeductionPercent) : null) : undefined,
        halfDayDeductionType: halfDayDeductionType !== undefined ? (halfDayDeductionType || null) : undefined,
        applyDeductionAfterHalfDays: applyDeductionAfterHalfDays !== undefined ? (applyDeductionAfterHalfDays ? parseInt(applyDeductionAfterHalfDays) : null) : undefined,
        halfDayDeductionAmount: halfDayDeductionAmount !== undefined ? (halfDayDeductionAmount ? parseFloat(halfDayDeductionAmount) : null) : undefined,
        shortDayDeductionType: shortDayDeductionType !== undefined ? (shortDayDeductionType || null) : undefined,
        applyDeductionAfterShortDays: applyDeductionAfterShortDays !== undefined ? (applyDeductionAfterShortDays ? parseInt(applyDeductionAfterShortDays) : null) : undefined,
        shortDayDeductionAmount: shortDayDeductionAmount !== undefined ? (shortDayDeductionAmount ? parseFloat(shortDayDeductionAmount) : null) : undefined,
        overtimeRate: overtimeRate !== undefined ? (overtimeRate ? parseFloat(overtimeRate) : null) : undefined,
        gazzetedOvertimeRate: gazzetedOvertimeRate !== undefined ? (gazzetedOvertimeRate ? parseFloat(gazzetedOvertimeRate) : null) : undefined,
        status: status || undefined,
      },
    });
    res.json({ status: true, data: policy, message: 'Working hours policy updated successfully' });
  } catch (error) {
    console.error('Error updating working hours policy:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Working hours policy with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update working hours policy' });
  }
};

export const deleteWorkingHoursPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.workingHoursPolicy.delete({ where: { id } });
    res.json({ status: true, message: 'Working hours policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting working hours policy:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete working hours policy' });
  }
};

