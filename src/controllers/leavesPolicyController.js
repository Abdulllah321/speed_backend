import prisma from "@/models/database.js";

export const getAllLeavesPolicies = async (req, res) => {
  const policies = await prisma.leavesPolicy.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      leaveTypes: { include: { leaveType: true } },
    },
  });
  const data = policies.map((p) => ({
    ...p,
    createdBy: p.createdBy
      ? `${p.createdBy.firstName} ${p.createdBy.lastName || ""}`.trim()
      : null,
    leaveTypes: p.leaveTypes.map((lt) => ({
      leaveTypeId: lt.leaveTypeId,
      leaveTypeName: lt.leaveType.name,
      numberOfLeaves: lt.numberOfLeaves,
    })),
  }));
  res.json({ status: true, data });
};

export const getLeavesPolicyById = async (req, res) => {
  const { id } = req.params;
  const policy = await prisma.leavesPolicy.findUnique({
    where: { id },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      leaveTypes: { include: { leaveType: true } },
    },
  });
  if (!policy) {
    return res
      .status(404)
      .json({ status: false, message: "Leave policy not found" });
  }
  res.json({
    status: true,
    data: {
      ...policy,
      createdBy: policy.createdBy
        ? `${policy.createdBy.firstName} ${
            policy.createdBy.lastName || ""
          }`.trim()
        : null,
      leaveTypes: policy.leaveTypes.map((lt) => ({
        leaveTypeId: lt.leaveTypeId,
        leaveTypeName: lt.leaveType.name,
        numberOfLeaves: lt.numberOfLeaves,
      })),
    },
  });
};

export const createLeavesPolicy = async (req, res) => {
  const {
    name,
    details,
    policyDateFrom,
    policyDateTill,
    fullDayDeductionRate,
    halfDayDeductionRate,
    shortLeaveDeductionRate,
    leaveTypes,
  } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: "Name is required" });
  }

  const policy = await prisma.leavesPolicy.create({
    data: {
      name: name.trim(),
      details: details?.trim() || null,
      policyDateFrom: policyDateFrom ? new Date(policyDateFrom) : null,
      policyDateTill: policyDateTill ? new Date(policyDateTill) : null,
      fullDayDeductionRate: fullDayDeductionRate
        ? parseFloat(fullDayDeductionRate)
        : null,
      halfDayDeductionRate: halfDayDeductionRate
        ? parseFloat(halfDayDeductionRate)
        : null,
      shortLeaveDeductionRate: shortLeaveDeductionRate
        ? parseFloat(shortLeaveDeductionRate)
        : null,
      createdById: req.user?.userId || null,
      leaveTypes:
        leaveTypes && Array.isArray(leaveTypes)
          ? {
              create: leaveTypes.map((lt) => ({
                leaveTypeId: lt.leaveTypeId,
                numberOfLeaves: parseInt(lt.numberOfLeaves) || 0,
              })),
            }
          : undefined,
    },
    include: {
      leaveTypes: { include: { leaveType: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  const data = {
    ...policy,
    createdBy: policy.createdBy
      ? `${policy.createdBy.firstName} ${
          policy.createdBy.lastName || ""
        }`.trim()
      : null,
    leaveTypes: policy.leaveTypes.map((lt) => ({
      leaveTypeId: lt.leaveTypeId,
      leaveTypeName: lt.leaveType.name,
      numberOfLeaves: lt.numberOfLeaves,
    })),
  };

  res
    .status(201)
    .json({ status: true, data, message: "Leave policy created successfully" });
};

export const createLeavesPoliciesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({
      status: false,
      message: "At least one leave policy is required",
    });
  }
  const validItems = items.filter((i) => i.name?.trim());
  if (!validItems.length) {
    return res.status(400).json({
      status: false,
      message: "At least one valid leave policy is required",
    });
  }
  const result = await prisma.leavesPolicy.createMany({
    data: validItems.map((i) => ({
      name: i.name.trim(),
      details: i.details?.trim() || null,
      createdById: req.user?.userId || null,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({
    status: true,
    data: result,
    message: `${result.count} leave policy/policies created successfully`,
  });
};

export const updateLeavesPolicy = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    details,
    policyDateFrom,
    policyDateTill,
    fullDayDeductionRate,
    halfDayDeductionRate,
    shortLeaveDeductionRate,
    leaveTypes,
  } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: "Name is required" });
  }

  // Delete existing leave types
  await prisma.leavesPolicyLeaveType.deleteMany({
    where: { leavesPolicyId: id },
  });

  const policy = await prisma.leavesPolicy.update({
    where: { id },
    data: {
      name: name.trim(),
      details: details?.trim() || null,
      policyDateFrom: policyDateFrom ? new Date(policyDateFrom) : null,
      policyDateTill: policyDateTill ? new Date(policyDateTill) : null,
      fullDayDeductionRate: fullDayDeductionRate
        ? parseFloat(fullDayDeductionRate)
        : null,
      halfDayDeductionRate: halfDayDeductionRate
        ? parseFloat(halfDayDeductionRate)
        : null,
      shortLeaveDeductionRate: shortLeaveDeductionRate
        ? parseFloat(shortLeaveDeductionRate)
        : null,
      leaveTypes:
        leaveTypes && Array.isArray(leaveTypes)
          ? {
              create: leaveTypes.map((lt) => ({
                leaveTypeId: lt.leaveTypeId,
                numberOfLeaves: parseInt(lt.numberOfLeaves) || 0,
              })),
            }
          : undefined,
    },
    include: {
      leaveTypes: { include: { leaveType: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  const data = {
    ...policy,
    createdBy: policy.createdBy
      ? `${policy.createdBy.firstName} ${
          policy.createdBy.lastName || ""
        }`.trim()
      : null,
    leaveTypes: policy.leaveTypes.map((lt) => ({
      leaveTypeId: lt.leaveTypeId,
      leaveTypeName: lt.leaveType.name,
      numberOfLeaves: lt.numberOfLeaves,
    })),
  };

  res.json({
    status: true,
    data,
    message: "Leave policy updated successfully",
  });
};

export const deleteLeavesPolicy = async (req, res) => {
  const { id } = req.params;
  await prisma.leavesPolicy.delete({ where: { id } });
  res.json({ status: true, message: "Leave policy deleted successfully" });
};

export const updateLeavesPoliciesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res
      .status(400)
      .json({ status: false, message: "At least one item is required" });
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
  res.json({
    status: true,
    message: `${updated.length} leave policy/policies updated successfully`,
  });
};

export const deleteLeavesPoliciesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res
      .status(400)
      .json({ status: false, message: "At least one id is required" });
  }
  const result = await prisma.leavesPolicy.deleteMany({
    where: { id: { in: ids } },
  });
  res.json({
    status: true,
    message: `${result.count} leave policy/policies deleted successfully`,
  });
};
