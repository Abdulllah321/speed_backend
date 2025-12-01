import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// State mapping for Pakistan
const PAKISTAN_STATES = [
  { name: 'AZAD KASHMIR' },
  { name: 'BALOCHISTAN' },
  { name: 'FANA' },
  { name: 'FATA' },
  { name: 'KPK' },
  { name: 'PUNJAB' },
  { name: 'SINDH' },
];

// Function to determine state based on city coordinates
// Pakistan geographic boundaries by state
function getStateByCoordinates(lat, lng, cityName) {
  // Known city mappings (exact matches)
  const knownCities = {
    'Islamabad': 'FANA',
    'Karachi': 'SINDH',
    'Lahore': 'PUNJAB',
    'Faisalabad': 'PUNJAB',
    'Rawalpindi': 'PUNJAB',
    'Multan': 'PUNJAB',
    'Hyderabad': 'SINDH',
    'Gujranwala': 'PUNJAB',
    'Peshawar': 'KPK',
    'Quetta': 'BALOCHISTAN',
    'Sargodha': 'PUNJAB',
    'Sialkot': 'PUNJAB',
    'Bahawalpur': 'PUNJAB',
    'Sukkur': 'SINDH',
    'Larkana': 'SINDH',
    'Sheikhupura': 'PUNJAB',
    'Jhang': 'PUNJAB',
    'Rahim Yar Khan': 'PUNJAB',
    'Gujrat': 'PUNJAB',
    'Kasur': 'PUNJAB',
    'Mardan': 'KPK',
    'Sahiwal': 'PUNJAB',
    'Nawabshah': 'SINDH',
    'Chiniot': 'PUNJAB',
    'Kotri': 'SINDH',
    'Khanpur': 'PUNJAB',
    'Hafizabad': 'PUNJAB',
    'Kohat': 'KPK',
    'Jacobabad': 'SINDH',
    'Shikarpur': 'SINDH',
    'Muzaffargarh': 'PUNJAB',
    'Khanewal': 'PUNJAB',
    'Gojra': 'PUNJAB',
    'Mandi Bahauddin': 'PUNJAB',
    'Abbottabad': 'KPK',
    'Mirpur Khas': 'SINDH',
    'Chaman': 'BALOCHISTAN',
    'Sibi': 'BALOCHISTAN',
    'Turbat': 'BALOCHISTAN',
    'Gwadar': 'BALOCHISTAN',
    'Zhob': 'BALOCHISTAN',
    'Dera Ismail Khan': 'KPK',
    'Swat': 'KPK',
    'Mingora': 'KPK',
    'Bannu': 'KPK',
    'Mansehra': 'KPK',
    'Muzaffarabad': 'AZAD KASHMIR',
    'Mirpur': 'AZAD KASHMIR',
    'Rawalakot': 'AZAD KASHMIR',
    'Dera Ghazi Khan': 'PUNJAB',
  };

  // Check known cities first
  if (knownCities[cityName]) {
    return knownCities[cityName];
  }

  // If no coordinates, default to PUNJAB
  if (!lat || !lng) {
    return 'PUNJAB';
  }

  // Geographic boundaries for states (approximate)
  // Punjab: lat 29-33, lng 70-75 (central/eastern)
  if (lat >= 29 && lat <= 33 && lng >= 70 && lng <= 75) {
    // Check if it's in Islamabad area (FANA)
    if (lat >= 33.5 && lat <= 34 && lng >= 72.8 && lng <= 73.2) {
      return 'FANA';
    }
    // Check if it's in KPK region (northwest)
    if (lat >= 33.5 && lng < 72) {
      return 'KPK';
    }
    // Check if it's in Azad Kashmir (northeast)
    if (lat >= 33.5 && lng >= 73.5) {
      return 'AZAD KASHMIR';
    }
    return 'PUNJAB';
  }

  // Sindh: lat 24-28, lng 67-71 (south)
  if (lat >= 24 && lat < 29 && lng >= 67 && lng <= 71) {
    return 'SINDH';
  }

  // KPK: lat 31-36, lng 70-74 (northwest, but excluding Punjab overlap)
  if (lat >= 31 && lat <= 36 && lng >= 70 && lng <= 74) {
    // Exclude Punjab region
    if (lat < 33.5 || (lat >= 33.5 && lng < 72)) {
      // Check for FATA (tribal areas near Afghanistan border)
      if (lat >= 33 && lat <= 35 && lng >= 70 && lng <= 71.5) {
        return 'FATA';
      }
      return 'KPK';
    }
    // Azad Kashmir region
    if (lat >= 33.5 && lng >= 73.5) {
      return 'AZAD KASHMIR';
    }
  }

  // Balochistan: lat 25-32, lng 60-68 (southwest)
  if (lat >= 25 && lat <= 32 && lng >= 60 && lng < 70) {
    return 'BALOCHISTAN';
  }

  // Azad Kashmir: lat 33-36, lng 73-75 (northeast)
  if (lat >= 33 && lat <= 36 && lng >= 73 && lng <= 75) {
    return 'AZAD KASHMIR';
  }

  // FANA: Islamabad region (lat 33.5-34, lng 72.8-73.2)
  if (lat >= 33.5 && lat <= 34 && lng >= 72.8 && lng <= 73.2) {
    return 'FANA';
  }

  // Default to PUNJAB for unmapped areas
  return 'PUNJAB';
}

export async function seedCities(prisma) {
  console.log('🏙️  Seeding states and cities for Pakistan...');
  
  // First, get Pakistan country
  const pakistan = await prisma.country.findFirst({
    where: { phoneCode: 92 },
  });

  if (!pakistan) {
    console.error('⚠️  Pakistan not found. Please seed countries first.');
    return { statesCreated: 0, statesSkipped: 0, citiesCreated: 0, citiesSkipped: 0 };
  }

  // Step 1: Seed States
  console.log('📍 Seeding states...');
  const stateMap = new Map();
  let statesCreated = 0;
  let statesSkipped = 0;

  for (const stateData of PAKISTAN_STATES) {
    try {
      const existing = await prisma.state.findFirst({
        where: {
          name: stateData.name,
          countryId: pakistan.id,
        },
      });

      if (existing) {
        stateMap.set(stateData.name, existing.id);
        statesSkipped++;
        continue;
      }

      const state = await prisma.state.create({
        data: {
          name: stateData.name,
          countryId: pakistan.id,
          status: 'active',
        },
      });
      stateMap.set(stateData.name, state.id);
      statesCreated++;
    } catch (error) {
      console.error(`Error seeding state "${stateData.name}":`, error.message);
    }
  }

  console.log(`✓ States: ${statesCreated} created, ${statesSkipped} skipped`);

  // Step 2: Seed Cities
  console.log('🏙️  Seeding cities...');
  const citiesPath = join(__dirname, '..', '..', 'city.json');
  const citiesData = JSON.parse(readFileSync(citiesPath, 'utf-8'));
  const pakistanCities = citiesData.filter(city => city.country === 'PK');

  let citiesCreated = 0;
  let citiesSkipped = 0;

  // Get default state (PUNJAB) for cities without mapping
  const defaultStateId = stateMap.get('PUNJAB');

  for (const city of pakistanCities) {
    try {
      const cityName = city.name?.trim();
      if (!cityName) continue;

      // Determine state for this city using coordinates
      const stateName = getStateByCoordinates(city.lat, city.lng, cityName);
      const stateId = stateMap.get(stateName) || defaultStateId;

      if (!stateId) {
        console.warn(`⚠️  State "${stateName}" not found for city "${cityName}", skipping`);
        continue;
      }

      const existing = await prisma.city.findFirst({
        where: {
          name: cityName,
          countryId: pakistan.id,
          stateId: stateId,
        },
      });

      if (existing) {
        citiesSkipped++;
        continue;
      }

      await prisma.city.create({
        data: {
          name: cityName,
          countryId: pakistan.id,
          stateId: stateId,
          status: 'active',
        },
      });
      citiesCreated++;
    } catch (error) {
      console.error(`Error seeding city "${city.name}":`, error.message);
    }
  }

  console.log(`✓ Cities: ${citiesCreated} created, ${citiesSkipped} skipped (total: ${pakistanCities.length})`);
  
  return {
    statesCreated,
    statesSkipped,
    citiesCreated,
    citiesSkipped,
    totalCities: pakistanCities.length,
  };
}
