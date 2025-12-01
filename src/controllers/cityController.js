import prisma from '@/models/database.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

export const seedCountries = async (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const countriesPath = join(__dirname, '..', '..', 'countries.json');
    const countriesData = JSON.parse(readFileSync(countriesPath, 'utf-8'));
    
    let countriesCreated = 0;
    let countriesUpdated = 0;
    
    console.log('🌍 Starting country seeding...');
    for (const item of countriesData) {
      const countryName = item.name?.trim();
      const countryIso = item.iso?.trim();
      
      if (!countryName || !countryIso) continue;
      
      // Parse numeric fields
      const phoneCode = item.phonecode ? parseInt(item.phonecode, 10) : null;
      const numcode = item.numcode ? parseInt(item.numcode, 10) : null;
      
      // Skip if phoneCode or numcode is invalid
      if (phoneCode === null || isNaN(phoneCode) || numcode === null || isNaN(numcode)) {
        console.warn(`⚠️  Skipping ${countryName}: invalid phoneCode or numcode`);
        continue;
      }
      
      const existing = await prisma.country.findFirst({
        where: { iso: countryIso },
      });
      
      if (existing) {
        await prisma.country.update({
          where: { id: existing.id },
          data: {
            name: countryName,
            iso: countryIso,
            nicename: item.nicename?.trim() || countryName,
            iso3: item.iso3?.trim() || '',
            phoneCode: phoneCode,
            numcode: numcode,
          },
        });
        countriesUpdated++;
      } else {
        await prisma.country.create({
          data: {
            name: countryName,
            iso: countryIso,
            nicename: item.nicename?.trim() || countryName,
            iso3: item.iso3?.trim() || '',
            phoneCode: phoneCode,
            numcode: numcode,
          },
        });
        countriesCreated++;
      }
    }
    console.log(`✓ Countries: ${countriesCreated} created, ${countriesUpdated} updated (total: ${countriesData.length})`);
    
    // Seed cities for Pakistan (phoneCode 92)
    console.log('🏙️  Starting city seeding for Pakistan...');
    const pakistan = await prisma.country.findFirst({
      where: { phoneCode: 92 },
    });
    
    if (!pakistan) {
      console.log('⚠️  Pakistan not found, skipping city seeding');
      return res.json({
        status: true,
        message: `Countries seeded successfully, but Pakistan not found for city seeding`,
        data: {
          countries: {
            total: countriesData.length,
            created: countriesCreated,
            updated: countriesUpdated,
          },
          cities: {
            total: 0,
            created: 0,
            updated: 0,
            message: 'Pakistan not found',
          },
        },
      });
    }
    
    const citiesPath = join(__dirname, '..', '..', 'city.json');
    const citiesData = JSON.parse(readFileSync(citiesPath, 'utf-8'));
    const pakistanCities = citiesData.filter(city => city.country === 'PK');
    
    let citiesCreated = 0;
    let citiesUpdated = 0;
    
    for (const city of pakistanCities) {
      const cityName = city.name?.trim();
      if (!cityName) continue;
      
      const existing = await prisma.city.findFirst({
        where: {
          name: cityName,
          countryId: pakistan.id,
        },
      });
      
      if (existing) {
        await prisma.city.update({
          where: { id: existing.id },
          data: {
            lat: city.lat || null,
            lng: city.lng || null,
          },
        });
        citiesUpdated++;
      } else {
        await prisma.city.create({
          data: {
            name: cityName,
            lat: city.lat || null,
            lng: city.lng || null,
            countryId: pakistan.id,
          },
        });
        citiesCreated++;
      }
    }
    
    console.log(`✓ Cities: ${citiesCreated} created, ${citiesUpdated} updated (total: ${pakistanCities.length})`);
    
    res.json({
      status: true,
      message: `Countries and cities seeded successfully`,
      data: {
        countries: {
          total: countriesData.length,
          created: countriesCreated,
          updated: countriesUpdated,
        },
        cities: {
          total: pakistanCities.length,
          created: citiesCreated,
          updated: citiesUpdated,
          country: 'Pakistan',
        },
      },
    });
  } catch (error) {
    console.error('❌ Error seeding countries/cities:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to seed countries/cities',
      error: error.message,
    });
  }
};

// City CRUD
export const getAllCities = async (req, res) => {
  const cities = await prisma.city.findMany({
    include: { country: true, state: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ status: true, data: cities });
};

export const getCitiesByCountry = async (req, res) => {
  const { countryId } = req.params;
  const cities = await prisma.city.findMany({
    where: { countryId },
    include: { state: true },
    orderBy: { name: 'asc' },
  });
  res.json({ status: true, data: cities });
};

// State CRUD
export const getAllStates = async (req, res) => {
  try {
    const states = await prisma.state.findMany({
      include: { country: true },
      orderBy: { name: 'asc' },
    });
    res.json({ status: true, data: states });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch states' });
  }
};

export const getStatesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    const states = await prisma.state.findMany({
      where: { countryId },
      orderBy: { name: 'asc' },
    });
    res.json({ status: true, data: states });
  } catch (error) {
    console.error('Error fetching states by country:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch states' });
  }
};

export const getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await prisma.state.findUnique({
      where: { id },
      include: { country: true },
    });
    if (!state) {
      return res.status(404).json({ status: false, message: 'State not found' });
    }
    res.json({ status: true, data: state });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch state' });
  }
};

export const createState = async (req, res) => {
  try {
    const { name, countryId, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    if (!countryId) {
      return res.status(400).json({ status: false, message: 'Country is required' });
    }
    const state = await prisma.state.create({
      data: {
        name: name.trim(),
        countryId,
        status: status || 'active',
        createdById: req.user?.userId || null,
      },
      include: { country: true },
    });
    res.status(201).json({ status: true, data: state, message: 'State created successfully' });
  } catch (error) {
    console.error('Error creating state:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'State with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create state' });
  }
};

export const createStatesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one state is required' });
    }
    const validItems = items.filter(i => i.name?.trim() && i.countryId);
    if (!validItems.length) {
      return res.status(400).json({ status: false, message: 'At least one valid state is required' });
    }
    const result = await prisma.state.createMany({
      data: validItems.map(i => ({
        name: i.name.trim(),
        countryId: i.countryId,
        status: i.status || 'active',
        createdById: req.user?.userId || null,
      })),
      skipDuplicates: true,
    });
    res.status(201).json({ status: true, data: result, message: `${result.count} state(s) created successfully` });
  } catch (error) {
    console.error('Error creating states bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to create states' });
  }
};

export const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, countryId, status } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: false, message: 'Name is required' });
    }
    const state = await prisma.state.update({
      where: { id },
      data: {
        name: name.trim(),
        countryId: countryId || undefined,
        status: status || undefined,
      },
      include: { country: true },
    });
    res.json({ status: true, data: state, message: 'State updated successfully' });
  } catch (error) {
    console.error('Error updating state:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'State with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update state' });
  }
};

export const updateStatesBulk = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ status: false, message: 'At least one item is required' });
    }
    const results = await Promise.all(
      items.map(async (item) => {
        if (!item.id || !item.name?.trim()) return null;
        return prisma.state.update({
          where: { id: item.id },
          data: {
            name: item.name.trim(),
            countryId: item.countryId || undefined,
            status: item.status || undefined,
          },
        });
      })
    );
    const updated = results.filter(Boolean);
    res.json({ status: true, message: `${updated.length} state(s) updated successfully` });
  } catch (error) {
    console.error('Error updating states bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to update states' });
  }
};

export const deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.state.delete({ where: { id } });
    res.json({ status: true, message: 'State deleted successfully' });
  } catch (error) {
    console.error('Error deleting state:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete state' });
  }
};

export const deleteStatesBulk = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) {
      return res.status(400).json({ status: false, message: 'At least one id is required' });
    }
    const result = await prisma.state.deleteMany({ where: { id: { in: ids } } });
    res.json({ status: true, message: `${result.count} state(s) deleted successfully` });
  } catch (error) {
    console.error('Error deleting states bulk:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete states' });
  }
};

export const getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await prisma.city.findMany({
      where: { stateId },
      select: {
        id: true,
        name: true,
        countryId: true,
        stateId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json({ status: true, data: cities });
  } catch (error) {
    console.error('Error fetching cities by state:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch cities' });
  }
};

export const createCity = async (req, res) => {
  const { name, countryId, stateId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  if (!countryId) {
    return res.status(400).json({ status: false, message: 'Country is required' });
  }
  if (!stateId) {
    return res.status(400).json({ status: false, message: 'State is required' });
  }
  const city = await prisma.city.create({
    data: {
      name: name.trim(),
      countryId,
      stateId,
    },
    include: { country: true, state: true },
  });
  res.status(201).json({ status: true, data: city, message: 'City created successfully' });
};

export const createCitiesBulk = async (req, res) => {
  const { items } = req.body;
  if (!items?.length) {
    return res.status(400).json({ status: false, message: 'At least one city is required' });
  }
  const validItems = items.filter(i => i.name?.trim() && i.countryId && i.stateId);
  if (!validItems.length) {
    return res.status(400).json({ status: false, message: 'At least one valid city is required' });
  }
  const result = await prisma.city.createMany({
    data: validItems.map(i => ({
      name: i.name.trim(),
      countryId: i.countryId,
      stateId: i.stateId,
    })),
    skipDuplicates: true,
  });
  res.status(201).json({ status: true, data: result, message: `${result.count} city(ies) created successfully` });
};

export const updateCity = async (req, res) => {
  const { id } = req.params;
  const { name, countryId, stateId } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: false, message: 'Name is required' });
  }
  if (!stateId) {
    return res.status(400).json({ status: false, message: 'State is required' });
  }
  const data = {
    name: name.trim(),
    stateId,
  };
  if (countryId) data.countryId = countryId;

  const city = await prisma.city.update({
    where: { id },
    data,
    include: { country: true, state: true },
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
      if (!item.id || !item.name?.trim() || !item.stateId) return null;
      return prisma.city.update({
        where: { id: item.id },
        data: {
          name: item.name.trim(),
          countryId: item.countryId || undefined,
          stateId: item.stateId,
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

