import prisma from '@/models/database.js';

// JobType CRUD
export const getAllJobTypes = async (req, res) => {
  const jobTypes = await prisma.jobType.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = jobTypes.map(j => ({
    ...j,
    createdBy: j.createdBy ? `${j.createdBy.firstName} ${j.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getJobTypeById = async (req, res) => {
  const { id } = req.params;
  const jobType = await prisma.jobType.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!jobType) {
    return res.status(404).json({ status: false, message: 'Job type not found' });
  }
  res.json({
    status: true,
    data: {
      ...jobType,
      createdBy: jobType.createdBy ? `${jobType.createdBy.firstName} ${jobType.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createJobType = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const jobType = await prisma.jobType.create({
    data: { name: name.trim(), createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: jobType, message: 'Job type created successfully' });
};

export const createJobTypesBulk = async (req, res) => {
  const { names } = req.body;
  if (!names?.length) {
    return res.status(400).json({ status: false, message: 'At least one name is required' });
  }
  const validNames = names.map(n => n?.trim()).filter(Boolean);
  if (!validNames.length) {
    return res.status(400).json({ status: false, message: 'At least one valid name is required' });
  }
  const result = await prisma.jobType.createMany({
    data: validNames.map(name => ({ name, createdById: req.user?.userId || null })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} job type(s) created successfully` });
};

export const updateJobType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const jobType = await prisma.jobType.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: jobType, message: 'Job type updated successfully' });
};

export const deleteJobType = async (req, res) => {
  const { id } = req.params;
  await prisma.jobType.delete({ where: { id } });
  res.json({ status: true, message: 'Job type deleted successfully' });
};

export const updateJobTypesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.jobType.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} job type(s) updated successfully` });
};

export const deleteJobTypesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.jobType.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} job type(s) deleted successfully` });
};

