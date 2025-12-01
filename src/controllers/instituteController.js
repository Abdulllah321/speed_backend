import prisma from '@/models/database.js';
import { seedInstitutes } from '../../prisma/seeds/institutes.js';

// Institute CRUD
export const getAllInstitutes = async (req, res) => {
  try {
    const institutes = await prisma.institute.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });
    res.json({ status: true, data: institutes });
  } catch (error) {
    console.error('Error fetching institutes:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch institutes' });
  }
};

export const getInstituteById = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await prisma.institute.findUnique({
      where: { id },
    });
    if (!institute) {
      return res.status(404).json({ status: false, message: 'Institute not found' });
    }
    res.json({ status: true, data: institute });
  } catch (error) {
    console.error('Error fetching institute:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch institute' });
  }
};

export const createInstitute = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    const institute = await prisma.institute.create({
      data: {
        name: name.trim(),
        status: status || 'active',
        createdById: req.user?.userId || null,
      },
    });
    res.status(201).json({ status: true, data: institute, message: 'Institute created successfully' });
  } catch (error) {
    console.error('Error creating institute:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Institute with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create institute' });
  }
};

export const createInstitutesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one institute is required' });
    }
    const validItems = items.filter(i => i.name?.trim());
    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid institute is required' });
    }
    const result = await prisma.institute.createMany({
      data: validItems.map(i => ({
        name: i.name.trim(),
        status: i.status || 'active',
        createdById: req.user?.userId || null,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ status: true, data: result, message: `${result.count} institute(s) created successfully` });
  } catch (error) {
    console.error('Error creating institutes bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create institutes' });
  }
};

export const updateInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    const institute = await prisma.institute.update({
      where: { id },
      data: {
        name: name.trim(),
        status: status || undefined,
      },
    });
    res.json({ status: true, data: institute, message: 'Institute updated successfully' });
  } catch (error) {
    console.error('Error updating institute:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Institute with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update institute' });
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.institute.delete({ where: { id } });
    res.json({ status: true, message: 'Institute deleted successfully' });
  } catch (error) {
    console.error('Error deleting institute:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete institute' });
  }
};

export const seedInstitutesAPI = async (req, res) => {
  try {
    console.log('🌱 Starting institute seeding via API...');
    const result = await seedInstitutes(prisma);
    
    res.json({
      status: true,
      message: `Institutes seeded successfully: ${result.created} created, ${result.skipped} skipped`,
      data: {
        total: result.created + result.skipped,
        created: result.created,
        skipped: result.skipped,
      },
    });
  } catch (error) {
    console.error('Error seeding institutes:', error);
    res.status(500).json({ 
      status: false, 
      message: error.message || 'Failed to seed institutes' 
    });
  }
};

