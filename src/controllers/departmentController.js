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
    where: { id: parseInt(id) },
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

export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const department = await prisma.department.update({
    where: { id: parseInt(id) },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: department, message: 'Department updated successfully' });
};

export const deleteDepartment = async (req, res) => {
  const { id } = req.params;
  await prisma.department.delete({
    where: { id: parseInt(id) },
  });
  res.json({ status: true, message: 'Department deleted successfully' });
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
    where: { departmentId: parseInt(departmentId) },
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
      departmentId: parseInt(departmentId) 
    },
    include: { department: true },
  });
  res.status(201).json({ status: true, data: subDepartment, message: 'Sub-department created successfully' });
};

export const updateSubDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, departmentId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const data = { name: name.trim() };
  if (departmentId) {
    data.departmentId = parseInt(departmentId);
  }
  const subDepartment = await prisma.subDepartment.update({
    where: { id: parseInt(id) },
    data,
    include: { department: true },
  });
  res.json({ status: true, data: subDepartment, message: 'Sub-department updated successfully' });
};

export const deleteSubDepartment = async (req, res) => {
  const { id } = req.params;
  await prisma.subDepartment.delete({
    where: { id: parseInt(id) },
  });
  res.json({ status: true, message: 'Sub-department deleted successfully' });
};

