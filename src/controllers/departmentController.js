import prisma from '@/models/database.js';

// Department CRUD
export const getAllDepartments = async (req, res) => {
  const departments = await prisma.department.findMany({
    include: { subDepartments: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: true, data: departments });
};

export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  const department = await prisma.department.findUnique({
    where: { id },
    include: { subDepartments: true },
  });
  if (!department) {
    return res.status(404).json({ status: false, message: 'Department not found' });
  }
  res.json({ status: true, data: department });
};

export const createDepartment = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const department = await prisma.department.create({
    data: { name: name.trim() },
  });
  res.status(201).json({ status: true, data: department, message: 'Department created successfully' });
};

export const createDepartmentsBulk = async (req, res) => {
  const { names } = req.body;
  if (!names?.length) {
    return res.status(400).json({ status: false, message: 'At least one name is required' });
  }
  const validNames = names.map(n => n?.trim()).filter(Boolean);
  if (!validNames.length) {
    return res.status(400).json({ status: false, message: 'At least one valid name is required' });
  }
  const result = await prisma.department.createMany({
    data: validNames.map(name => ({ name })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} department(s) created successfully` });
};

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const department = await prisma.department.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: department, message: 'Department updated successfully' });
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  await prisma.department.delete({
    where: { id },
  });
  res.json({ status: true, message: 'Department deleted successfully' });
};

export const updateDepartmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }

  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.department.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );

  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} department(s) updated successfully` });
};

export const deleteDepartmentsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }

  const result = await prisma.department.deleteMany({
    where: { id: { in: ids } },
  });

  res.json({ status: true, message: `${result.count} department(s) deleted successfully` });
};

// Sub-Department CRUD
export const getAllSubDepartments = async (req, res) => {
  const subDepartments = await prisma.subDepartment.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: true, data: subDepartments });
};

export const getSubDepartmentsByDepartment = async (req, res) => {
  const { departmentId } = req.params;
  const subDepartments = await prisma.subDepartment.findMany({
    where: { departmentId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: true, data: subDepartments });
};

export const createSubDepartment = async (req, res) => {
  const { name, departmentId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  if (!departmentId) {
    return res.status(400).json({ status: false, message: 'Department is required' });
  }
  const subDepartment = await prisma.subDepartment.create({
    data: { 
      name: name.trim(), 
      departmentId 
    },
    include: { department: true },
  });
  res.status(201).json({ status: true, data: subDepartment, message: 'Sub-department created successfully' });
};

export const createSubDepartmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one sub-department is required' });
  }
  const validItems = items.filter(i => i.name?.trim() && i.departmentId);
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid sub-department is required' });
  }
  const result = await prisma.subDepartment.createMany({
    data: validItems.map(i => ({ name: i.name.trim(), departmentId: i.departmentId })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} sub-department(s) created successfully` });
};

export const updateSubDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, departmentId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const data = { name: name.trim() };
  if (departmentId) {
    data.departmentId = departmentId;
  }
  const subDepartment = await prisma.subDepartment.update({
    where: { id },
    data,
    include: { department: true },
  });
  res.json({ status: true, data: subDepartment, message: 'Sub-department updated successfully' });
};

export const deleteSubDepartment = async (req, res) => {
  const { id } = req.params;
  await prisma.subDepartment.delete({
    where: { id },
  });
  res.json({ status: true, message: 'Sub-department deleted successfully' });
};

export const updateSubDepartmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }

  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.subDepartment.update({
        where: { id: item.id },
        data: {
          name: item.name.trim(),
          ...(item.departmentId && { departmentId: item.departmentId }),
        },
      });
    })
  );

  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} sub-department(s) updated successfully` });
};

export const deleteSubDepartmentsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }

  const result = await prisma.subDepartment.deleteMany({
    where: { id: { in: ids } },
  });

  res.json({ status: true, message: `${result.count} sub-department(s) deleted successfully` });
};

