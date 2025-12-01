import prisma from '@/models/database.js';

// Qualification CRUD
export const getAllQualifications = async (req, res) => {
  try {
    const qualifications = await prisma.qualification.findMany({
      include: {
        institute: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ status: true, data: qualifications });
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch qualifications' });
  }
};

export const getQualificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const qualification = await prisma.qualification.findUnique({
      where: { id },
      include: {
        institute: true,
      },
    });

    if (!qualification) {
      return res.status(404).json({ status: false, message: 'Qualification not found' });
    }
    res.json({ status: true, data: qualification });
  } catch (error) {
    console.error('Error fetching qualification:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch qualification' });
  }
};

export const createQualification = async (req, res) => {
  try {
    const { instituteId, instituteName, qualification, country, city } = req.body;
    
    if (!instituteName?.trim()) {
      return res.status(400).json({ status: false, message: 'Institute name is required' });
    }
    if (!qualification?.trim()) {
      return res.status(400).json({ status: false, message: 'Qualification is required' });
    }
    if (!country?.trim()) {
      return res.status(400).json({ status: false, message: 'Country is required' });
    }
    if (!city?.trim()) {
      return res.status(400).json({ status: false, message: 'City is required' });
    }

    const qualificationData = await prisma.qualification.create({
      data: {
        instituteId: instituteId || null,
        instituteName: instituteName.trim(),
        qualification: qualification.trim(),
        country: country.trim(),
        city: city.trim(),
        status: 'active',
        createdById: req.user?.userId || null,
      },
      include: {
        institute: true,
      },
    });
    
    res.status(201).json({ 
      status: true, 
      data: qualificationData, 
      message: 'Qualification created successfully' 
    });
  } catch (error) {
    console.error('Error creating qualification:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create qualification' });
  }
};

export const createQualificationsBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one qualification is required' });
    }

    const validItems = items.filter(item => 
      item.instituteName?.trim() && 
      item.qualification?.trim() && 
      item.country?.trim() && 
      item.city?.trim()
    );

    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid qualification is required' });
    }

    const results = await Promise.all(
      validItems.map(item =>
        prisma.qualification.create({
          data: {
            instituteId: item.instituteId || null,
            instituteName: item.instituteName.trim(),
            qualification: item.qualification.trim(),
            country: item.country.trim(),
            city: item.city.trim(),
            status: 'active',
            createdById: req.user?.userId || null,
          },
        })
      )
    );

    res.status(201).json({ 
      status: true, 
      message: `${results.length} qualification(s) created successfully` 
    });
  } catch (error) {
    console.error('Error creating qualifications bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create qualifications' });
  }
};

export const updateQualification = async (req, res) => {
  try {
    const { id } = req.params;
    const { instituteId, instituteName, qualification, country, city, status } = req.body;

    if (!instituteName?.trim()) {
      return res.status(400).json({ status: false, message: 'Institute name is required' });
    }
    if (!qualification?.trim()) {
      return res.status(400).json({ status: false, message: 'Qualification is required' });
    }
    if (!country?.trim()) {
      return res.status(400).json({ status: false, message: 'Country is required' });
    }
    if (!city?.trim()) {
      return res.status(400).json({ status: false, message: 'City is required' });
    }

    const qualificationData = await prisma.qualification.update({
      where: { id },
      data: {
        instituteId: instituteId || null,
        instituteName: instituteName.trim(),
        qualification: qualification.trim(),
        country: country.trim(),
        city: city.trim(),
        status: status || undefined,
      },
      include: {
        institute: true,
      },
    });

    res.json({ 
      status: true, 
      data: qualificationData, 
      message: 'Qualification updated successfully' 
    });
  } catch (error) {
    console.error('Error updating qualification:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to update qualification' });
  }
};

export const deleteQualification = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.qualification.delete({ where: { id } });
    res.json({ status: true, message: 'Qualification deleted successfully' });
  } catch (error) {
    console.error('Error deleting qualification:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete qualification' });
  }
};

