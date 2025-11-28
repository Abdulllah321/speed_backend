import prisma from '@/models/database.js';

export const getAllEquipments = async (req, res) => {
  const equipments = await prisma.equipment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  const data = equipments.map(e => ({
    ...e,
    createdBy: e.createdBy ? `${e.createdBy.firstName} ${e.createdBy.lastName || ''}`.trim() : null,
  }));
  res.json({ status: true, data });
};

export const getEquipmentById = async (req, res) => {
  const { id } = req.params;
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: { createdBy: { select: { firstName: true, lastName: true } } },
  });
  if (!equipment) {
    return res.status(404).json({ status: false, message: 'Equipment not found' });
  }
  res.json({
    status: true,
    data: {
      ...equipment,
      createdBy: equipment.createdBy ? `${equipment.createdBy.firstName} ${equipment.createdBy.lastName || ''}`.trim() : null,
    },
  });
};

export const createEquipment = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const equipment = await prisma.equipment.create({
    data: { name: name.trim(), createdById: req.user?.userId || null },
  });
  res.status(201).json({ status: true, data: equipment, message: 'Equipment created successfully' });
};

export const createEquipmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one equipment is required' });
  }
  const validItems = items.filter(i => i.name?.trim());
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid equipment is required' });
  }
  const result = await prisma.equipment.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      createdById: req.user?.userId || null,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} equipment(s) created successfully` });
};

export const updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const equipment = await prisma.equipment.update({
    where: { id },
    data: { name: name.trim() },
  });
  res.json({ status: true, data: equipment, message: 'Equipment updated successfully' });
};

export const deleteEquipment = async (req, res) => {
  const { id } = req.params;
  await prisma.equipment.delete({ where: { id } });
  res.json({ status: true, message: 'Equipment deleted successfully' });
};

export const updateEquipmentsBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.equipment.update({
        where: { id: item.id },
        data: { name: item.name.trim() },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} equipment(s) updated successfully` });
};

export const deleteEquipmentsBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.equipment.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} equipment(s) deleted successfully` });
};

