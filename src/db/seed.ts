import { pool } from './index';
import { PoolClient } from 'pg';
import { fakerEN_NG as faker } from '@faker-js/faker';

// Seed counts per requirement
const AGENT_COUNT = 250;
const PROPERTY_COUNT = 500;
const IMAGE_COUNT = 1000;
const INQUIRY_COUNT = 600;

// Domain constants matching DB CHECK constraints
const PROPERTY_TYPES = ['apartment', 'house', 'duplex', 'land'] as const;
const LISTING_TYPES = ['sale', 'rent'] as const;
const STATUS_VALUES = ['available', 'sold', 'rented', 'unavailable'] as const;

// Nigerian geography and real estate data
const NIGERIAN_LOCATIONS: Record<string, { state: string; areas: string[] }> = {
  'Lagos': {
    state: 'Lagos',
    areas: ['Ikoyi', 'Victoria Island', 'Lekki Phase 1', 'Ikeja GRA', 'Banana Island', 'Chevron', 'Ajah', 'Surulere', 'Yaba', 'Magodo'],
  },
  'Abuja': {
    state: 'Federal Capital Territory',
    areas: ['Maitama', 'Asokoro', 'Wuse 2', 'Gwarinpa', 'Jabi', 'Guzape', 'Katampe', 'Utako', 'Apo', 'Lugbe'],
  },
  'Port Harcourt': {
    state: 'Rivers',
    areas: ['GRA Phase 2', 'Ada George', 'Trans Amadi', 'Old GRA', 'Rumuibekwe', 'Woji'],
  },
  'Ibadan': {
    state: 'Oyo',
    areas: ['Bodija', 'Iyaganku GRA', 'Oluyole Estate', 'Jericho', 'Akobo', 'Challenge'],
  },
  'Enugu': {
    state: 'Enugu',
    areas: ['Independence Layout', 'GRA Enugu', 'Trans Ekulu', 'New Haven'],
  },
  'Kano': {
    state: 'Kano',
    areas: ['Nassarawa GRA', 'Badrariya', 'Farm Centre', 'Tarauni'],
  },
};

const CITIES = Object.keys(NIGERIAN_LOCATIONS);

const NIGERIAN_AGENCIES = [
  'Crownfield Realty & Properties',
  'Eko Haven Properties',
  'Apex Heights Real Estate',
  'Zion Gate Realty',
  'Kestrel & Oaks Properties',
  'Naija Horizon Realty',
  'Prestige Vantage Properties',
  'Silverstone Real Estate',
  'Crestline Development Co.',
  'Lekki Pearl Realty',
  'Maitama Prime Properties',
  'Greenpark Homes & Estate',
  'Heritage Apex Realty',
  'Bluecrest Property Management',
];

// Typical NIGERIAN phone prefix generator
const generateNigerianPhone = (): string => {
  const prefixes = ['0803', '0806', '0813', '0816', '0805', '0807', '0815', '0802', '0812', '0703', '0903', '0906'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const remaining = Math.floor(1000000 + Math.random() * 9000000).toString();
  return `${prefix}${remaining}`;
};

const getRandom = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];

// Realistic pricing logic based on location, listing type, and property type (in NGN)
const calculatePrice = (
  city: string,
  listingType: typeof LISTING_TYPES[number],
  propertyType: typeof PROPERTY_TYPES[number]
): bigint => {
  const isPrimeLocation = city === 'Lagos' || city === 'Abuja';

  if (listingType === 'rent') {
    // Annual rent in NGN
    let baseMin = 800_000;
    let baseMax = 3_500_000;

    if (propertyType === 'duplex') {
      baseMin = 4_000_000;
      baseMax = 15_000_000;
    } else if (propertyType === 'house') {
      baseMin = 2_500_000;
      baseMax = 8_000_000;
    } else if (propertyType === 'land') {
      // Lease for commercial/event land
      baseMin = 1_500_000;
      baseMax = 6_000_000;
    }

    if (isPrimeLocation) {
      baseMin *= 2;
      baseMax *= 3;
    }

    const price = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
    return BigInt(price);
  } else {
    // Sale price in NGN
    let baseMin = 25_000_000;
    let baseMax = 120_000_000;

    if (propertyType === 'duplex') {
      baseMin = 85_000_000;
      baseMax = 350_000_000;
    } else if (propertyType === 'house') {
      baseMin = 50_000_000;
      baseMax = 200_000_000;
    } else if (propertyType === 'land') {
      baseMin = 15_000_000;
      baseMax = 250_000_000;
    }

    if (isPrimeLocation) {
      baseMin *= 2;
      baseMax *= 4;
    }

    const price = Math.floor(Math.random() * (baseMax - baseMin + 1)) + baseMin;
    return BigInt(price);
  }
};

const generatePropertyTitle = (
  propertyType: typeof PROPERTY_TYPES[number],
  listingType: typeof LISTING_TYPES[number],
  area: string,
  bedrooms: number | null
): string => {
  const listingVerb = listingType === 'sale' ? 'For Sale' : 'For Rent';

  if (propertyType === 'land') {
    const landTypes = ['Commercial Plot', 'Residential Land', 'Serviced Plot', 'Cornerpiece Plot'];
    return `${getRandom(landTypes)} in ${area} - ${listingVerb}`;
  }

  const descriptors = ['Luxury', 'Modern', 'Newly Built', 'Spacious', 'Fully Serviced', 'Exquisite'];
  const desc = getRandom(descriptors);
  const bedStr = bedrooms ? `${bedrooms} Bedroom ` : '';

  let typeStr = 'Apartment';
  if (propertyType === 'duplex') typeStr = getRandom(['Fully Detached Duplex', 'Semi-Detached Duplex', 'Terraced Duplex']);
  if (propertyType === 'house') typeStr = getRandom(['Bungalow', 'Detached House', 'Townhouse']);

  return `${desc} ${bedStr}${typeStr} in ${area} - ${listingVerb}`;
};

const generatePropertyDescription = (
  propertyType: typeof PROPERTY_TYPES[number],
  area: string,
  city: string
): string => {
  if (propertyType === 'land') {
    return `Prime parcel of land located in a serene and fast-developing neighborhood in ${area}, ${city}. Features include dry land, clear C of O / Governor's Consent title documents, good road network, and excellent drainage system. Perfect for immediate development or land banking investment.`;
  }

  return `Beautifully finished property situated in the prestigious neighborhood of ${area}, ${city}. Features 24/7 security, constant power supply, ample parking space, fitted kitchen with modern heat extractor, all rooms ensuite, POP ceiling, water treatment plant, and clean treated water supply. Close proximity to top international schools, shopping malls, and major expressways.`;
};

const SEED_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
];

const INQUIRY_MESSAGES = [
  'Hello, I am interested in this property. Please let me know when we can schedule an inspection.',
  'Is this listing still available? I would like to make an offer.',
  'Good day, can you provide details regarding the title document for this property?',
  'Hi, what is the payment plan option for this property? I am ready to inspect this weekend.',
  'Interested in this listing. Kindly share more photos and the exact location coordinates.',
  'Hello, is the price negotiable for an immediate cash payment?',
];

// Seed main function
const runSeed = async () => {
  const client: PoolClient = await pool.connect();

  try {
    console.log('🌱 Starting Nigerian property listings database seed...');
    await client.query('BEGIN');

    // Step 1: Repeatable reset via TRUNCATE CASCADE on resource tables ONLY
    console.log('🧹 Truncating existing seedable resource tables (preserving schema_migrations)...');
    await client.query('TRUNCATE TABLE inquiries, images, properties, agents RESTART IDENTITY CASCADE');

    // Step 2: Seed Agents (250)
    console.log(`👤 Seeding ${AGENT_COUNT} agents...`);
    const agentIds: string[] = [];

    for (let i = 0; i < AGENT_COUNT; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 1}@example.com`;
      const phone = generateNigerianPhone();
      const agencyName = Math.random() < 0.75 ? getRandom(NIGERIAN_AGENCIES) : null;
      const city = getRandom(CITIES);
      const state = NIGERIAN_LOCATIONS[city].state;

      const res = await client.query(
        `INSERT INTO agents (name, email, phone, agency_name, city, state)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, email, phone, agencyName, city, state]
      );
      agentIds.push(res.rows[0].id);
    }

    // Step 3: Seed Properties (500)
    console.log(`🏠 Seeding ${PROPERTY_COUNT} properties...`);
    const propertyIds: string[] = [];

    for (let i = 0; i < PROPERTY_COUNT; i++) {
      const agentId = getRandom(agentIds);
      const propertyType = getRandom(PROPERTY_TYPES);
      const listingType = getRandom(LISTING_TYPES);
      const city = getRandom(CITIES);
      const locationInfo = NIGERIAN_LOCATIONS[city];
      const area = getRandom(locationInfo.areas);
      const state = locationInfo.state;

      const bedrooms = propertyType === 'land' ? null : Math.floor(Math.random() * 5) + 1;
      const bathrooms = propertyType === 'land' ? null : Math.min(bedrooms || 1, Math.floor(Math.random() * 4) + 1);

      const price = calculatePrice(city, listingType, propertyType);
      const title = generatePropertyTitle(propertyType, listingType, area, bedrooms);
      const description = generatePropertyDescription(propertyType, area, city);
      const address = `${faker.location.buildingNumber()} ${faker.location.street()}, ${area}`;

      // Realistic status distribution
      let status: typeof STATUS_VALUES[number] = 'available';
      const randStatus = Math.random();
      if (randStatus > 0.85) {
        status = listingType === 'sale' ? 'sold' : 'rented';
      } else if (randStatus > 0.75) {
        status = 'unavailable';
      }

      const res = await client.query(
        `INSERT INTO properties (
           agent_id, title, description, property_type, listing_type,
           price, bedrooms, bathrooms, address, city, state, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          agentId,
          title,
          description,
          propertyType,
          listingType,
          price.toString(),
          bedrooms,
          bathrooms,
          address,
          city,
          state,
          status,
        ]
      );
      propertyIds.push(res.rows[0].id);
    }

    // Step 4: Seed Images (1,000)
    console.log(`🖼️  Seeding ${IMAGE_COUNT} property images...`);

    // Assign at least 1 primary image to each property first
    const primaryImageCount = Math.min(IMAGE_COUNT, propertyIds.length);
    for (let i = 0; i < primaryImageCount; i++) {
      const propertyId = propertyIds[i];
      const url = getRandom(SEED_IMAGE_URLS);
      const altText = `Exterior view of property listing`;
      await client.query(
        `INSERT INTO images (property_id, url, alt_text, is_primary)
         VALUES ($1, $2, $3, true)`,
        [propertyId, url, altText]
      );
    }

    // Assign remaining images randomly across properties as non-primary
    const remainingImages = IMAGE_COUNT - primaryImageCount;
    for (let i = 0; i < remainingImages; i++) {
      const propertyId = getRandom(propertyIds);
      const url = getRandom(SEED_IMAGE_URLS);
      const altText = `Interior view showing feature details`;
      await client.query(
        `INSERT INTO images (property_id, url, alt_text, is_primary)
         VALUES ($1, $2, $3, false)`,
        [propertyId, url, altText]
      );
    }

    // Step 5: Seed Inquiries (600)
    console.log(`✉️  Seeding ${INQUIRY_COUNT} property inquiries...`);
    for (let i = 0; i < INQUIRY_COUNT; i++) {
      const propertyId = getRandom(propertyIds);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 1}@example.com`;
      const phone = Math.random() < 0.8 ? generateNigerianPhone() : null;
      const message = getRandom(INQUIRY_MESSAGES);

      await client.query(
        `INSERT INTO inquiries (property_id, name, email, phone, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [propertyId, name, email, phone, message]
      );
    }

    await client.query('COMMIT');
    console.log(`🎉 Database seeding completed successfully!`);
    console.log(`   - Agents: ${AGENT_COUNT}`);
    console.log(`   - Properties: ${PROPERTY_COUNT}`);
    console.log(`   - Images: ${IMAGE_COUNT}`);
    console.log(`   - Inquiries: ${INQUIRY_COUNT}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed. Transaction rolled back:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

runSeed().catch(() => process.exit(1));
