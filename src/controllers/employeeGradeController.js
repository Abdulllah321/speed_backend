import prisma from '@/models/database.js';

// EmployeeGrade CRUD
export const getAllEmployeeGrades = async (req, res) => {
  try {
    const employeeGrades = await prisma.employeeGrade.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    const data = employeeGrades.map(eg => ({
      ...eg,
      createdBy: eg.createdBy ? `${eg.createdBy.firstName} ${eg.createdBy.lastName || ''}`.trim() : null,
    }));
    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching employee grades:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch employee grades' });
  }
};

export const getEmployeeGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeGrade = await prisma.employeeGrade.findUnique({
      where: { id },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!employeeGrade) {
      return res.status(404).json({ status: false, message: 'Employee grade not found' });
    }
    res.json({
      status: true,
      data: {
        ...employeeGrade,
        createdBy: employeeGrade.createdBy ? `${employeeGrade.createdBy.firstName} ${employeeGrade.createdBy.lastName || ''}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching employee grade:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch employee grade' });
  }
};

export const createEmployeeGrade = async (req, res) => {
  try {
    const { grade, status } = req.body;
    if (!grade?.trim()) {
      return res.status(400).json({ status: false, message: 'Grade is required' });
    }
    const employeeGrade = await prisma.employeeGrade.create({
      data: { 
        grade: grade.trim(), 
        status: status || 'active',
        createdById: req.user?.userId || null 
      },
    });
    res.status(201).json({ status: true, data: employeeGrade, message: 'Employee grade created successfully' });
  } catch (error) {
    console.error('Error creating employee grade:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Employee grade with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create employee grade' });
  }
};

export const createEmployeeGradesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one employee grade is required' });
    }
    const validItems = items.filter(i => i.grade?.trim());
    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid employee grade is required' });
    }
    const result = await prisma.employeeGrade.createMany({
      data: validItems.map(i => ({
        grade: i.grade.trim(),
        status: i.status || 'active',
        createdById: req.user?.userId || null,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ status: true, data: result, message: `${result.count} employee grade(s) created successfully` });
  } catch (error) {
    console.error('Error creating employee grades bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create employee grades' });
  }
};

export const updateEmployeeGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, status } = req.body;
    if (!grade?.trim()) {
      return res.status(400).json({ status: false, message: 'Grade is required' });
    }
    const employeeGrade = await prisma.employeeGrade.update({
      where: { id },
      data: { 
        grade: grade.trim(),
        status: status || undefined,
      },
    });
    res.json({ status: true, data: employeeGrade, message: 'Employee grade updated successfully' });
  } catch (error) {
    console.error('Error updating employee grade:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Employee grade with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update employee grade' });
  }
};

export const deleteEmployeeGrade = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.employeeGrade.delete({ where: { id } });
    res.json({ status: true, message: 'Employee grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee grade:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete employee grade' });
  }
};

export const updateEmployeeGradesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one item is required' });
    }
    const results = await Promise.all(
      items.map(async (item) => {
        if (!item.id || !item.grade?.trim()) return null;
        return prisma.employeeGrade.update({
          where: { id: item.id },
          data: { 
            grade: item.grade.trim(),
            status: item.status || undefined,
          },
        });
      })
    );
    const updated = results.filter(Boolean);
    res.json({ status: true, message: `${updated.length} employee grade(s) updated successfully` });
  } catch (error) {
    console.error('Error updating employee grades bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to update employee grades' });
  }
};

export const deleteEmployeeGradesBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res.status(400).json({ status: false, message: 'At least one id is required' });
    }
    const result = await prisma.employeeGrade.deleteMany({ where: { id: { in: ids } } });
    res.json({ status: true, message: `${result.count} employee grade(s) deleted successfully` });
  } catch (error) {
    console.error('Error deleting employee grades bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete employee grades' });
  }
};

