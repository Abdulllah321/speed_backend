import prisma from '@/models/database.js';

// Country CRUD
export const getAllCountries = async (req, res) => {
  const countries = await prisma.country.findMany({
    include: { cities: true },
    orderBy: { name: 'asc' },
  });
  res.json({ status: true, data: countries });
};

export const createCountry = async (req, res) => {
  const { name, code } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const country = await prisma.country.create({
    data: { name: name.trim(), code: code?.trim() || null },
  });
  res.status(201).json({ status: true, data: country, message: 'Country created successfully' });
};

export const createCountriesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one country is required' });
  }
  const validItems = items.filter(i => i.name?.trim());
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid country is required' });
  }
  const result = await prisma.country.createMany({
    data: validItems.map(i => ({ name: i.name.trim(), code: i.code?.trim() || null })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} country(ies) created successfully` });
};

export const updateCountry = async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const country = await prisma.country.update({
    where: { id },
    data: { name: name.trim(), code: code?.trim() || null },
  });
  res.json({ status: true, data: country, message: 'Country updated successfully' });
};

export const updateCountriesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.country.update({
        where: { id: item.id },
        data: { name: item.name.trim(), code: item.code?.trim() || null },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} country(ies) updated successfully` });
};

export const deleteCountry = async (req, res) => {
  const { id } = req.params;
  await prisma.country.delete({ where: { id } });
  res.json({ status: true, message: 'Country deleted successfully' });
};

export const deleteCountriesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.country.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} country(ies) deleted successfully` });
};

// City CRUD
export const getAllCities = async (req, res) => {
  const cities = await prisma.city.findMany({
    include: { country: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: true, data: cities });
};

export const getCitiesByCountry = async (req, res) => {
  const { countryId } = req.params;
  const cities = await prisma.city.findMany({
    where: { countryId },
    orderBy: { name: 'asc' },
  });
  res.json({ status: true, data: cities });
};

export const createCity = async (req, res) => {
  const { name, countryId, lat, lng } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  if (!countryId) {
    return res.status(400).json({ status: false, message: 'Country is required' });
  }
  const city = await prisma.city.create({
    data: {
      name: name.trim(),
      countryId,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    },
    include: { country: true },
  });
  res.status(201).json({ status: true, data: city, message: 'City created successfully' });
};

export const createCitiesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one city is required' });
  }
  const validItems = items.filter(i => i.name?.trim() && i.countryId);
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid city is required' });
  }
  const result = await prisma.city.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      countryId: i.countryId,
      lat: i.lat ? parseFloat(i.lat) : null,
      lng: i.lng ? parseFloat(i.lng) : null,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} city(ies) created successfully` });
};

export const updateCity = async (req, res) => {
  const { id } = req.params;
  const { name, countryId, lat, lng } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  const data = {
    name: name.trim(),
    lat: lat !== undefined ? (lat ? parseFloat(lat) : null) : undefined,
    lng: lng !== undefined ? (lng ? parseFloat(lng) : null) : undefined,
  };
  if (countryId) data.countryId = countryId;

  const city = await prisma.city.update({
    where: { id },
    data,
    include: { country: true },
  });
  res.json({ status: true, data: city, message: 'City updated successfully' });
};

export const updateCitiesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one item is required' });
  }
  const results = await Promise.all(
    items.map(async (item) => {
      if (!item.id || !item.name?.trim()) return null;
      return prisma.city.update({
        where: { id: item.id },
        data: {
          name: item.name.trim(),
          countryId: item.countryId || undefined,
          lat: item.lat !== undefined ? (item.lat ? parseFloat(item.lat) : null) : undefined,
          lng: item.lng !== undefined ? (item.lng ? parseFloat(item.lng) : null) : undefined,
        },
      });
    })
  );
  const updated = results.filter(Boolean);
  res.json({ status: true, message: `${updated.length} city(ies) updated successfully` });
};

export const deleteCity = async (req, res) => {
  const { id } = req.params;
  await prisma.city.delete({ where: { id } });
  res.json({ status: true, message: 'City deleted successfully' });
};

export const deleteCitiesBulk = async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) {
    return res.status(400).json({ status: false, message: 'At least one id is required' });
  }
  const result = await prisma.city.deleteMany({ where: { id: { in: ids } } });
  res.json({ status: true, message: `${result.count} city(ies) deleted successfully` });
};

