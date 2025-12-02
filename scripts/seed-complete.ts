/**
 * Complete seed script with:
 * - Realistic brand accounts with users
 * - Product data with R2 image uploads
 * - Tags with proper distribution metadata
 * - QR code generation and R2 upload
 * - Various scan patterns including suspicious ones
 *
 * Usage:
 *   npx tsx scripts/seed-complete.ts [--upload-r2] [--clean]
 *
 * Options:
 *   --upload-r2  Upload QR codes and metadata to R2 (requires R2 env vars)
 *   --clean      Clear existing data before seeding
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

// Check command line args
const UPLOAD_TO_R2 = process.argv.includes('--upload-r2');
const CLEAN_DATA = process.argv.includes('--clean');

// R2 upload function (conditional import)
let uploadFile:
  | ((
      key: string,
      body: Buffer,
      contentType: string
    ) => Promise<{ url: string }>)
  | null = null;
let getFileUrl: ((key: string) => string) | null = null;

async function initR2() {
  if (UPLOAD_TO_R2) {
    try {
      const r2Module = await import('../src/lib/r2');
      uploadFile = r2Module.uploadFile;
      getFileUrl = r2Module.getFileUrl;
      console.log('R2 module loaded successfully');
    } catch (error) {
      console.error('Failed to load R2 module. Make sure R2 env vars are set.');
      console.error(error);
      process.exit(1);
    }
  }
}

// ============================================================================
// REALISTIC BRAND DATA
// ============================================================================

type BrandData = {
  name: string;
  description: string;
  category: string;
  user: {
    email: string;
    password: string;
    name: string;
  };
  products: ProductData[];
};

type ProductData = {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  specs: Record<string, string>;
  weight: string;
  color?: string;
  size?: string;
  material?: string;
};

const BRANDS: BrandData[] = [
  {
    name: 'Batik Keris',
    description:
      'Brand batik premium Indonesia sejak 1970. Menyediakan batik tulis dan cap berkualitas tinggi dengan motif tradisional Jawa.',
    category: 'Fashion',
    user: {
      email: 'admin@batikkeris.id',
      password: 'batik2024',
      name: 'Siti Rahayu',
    },
    products: [
      {
        name: 'Kemeja Batik Parang Rusak',
        description:
          'Kemeja batik tulis motif Parang Rusak, simbol kekuatan dan keberanian. Dibuat dengan teknik tulis tradisional.',
        price: 850000,
        category: 'Shirt',
        sku: 'BK-KMPR-001',
        specs: { technique: 'Batik Tulis', origin: 'Solo' },
        weight: '250g',
        material: 'Katun Primisima',
        size: 'L',
        color: 'Sogan Brown',
      },
      {
        name: 'Dress Batik Mega Mendung',
        description:
          'Dress batik cap motif Mega Mendung khas Cirebon. Cocok untuk acara formal maupun casual.',
        price: 650000,
        category: 'Dress',
        sku: 'BK-DRMM-002',
        specs: { technique: 'Batik Cap', origin: 'Cirebon' },
        weight: '300g',
        material: 'Katun Doby',
        size: 'M',
        color: 'Navy Blue',
      },
      {
        name: 'Kain Batik Kawung',
        description:
          'Kain batik tulis motif Kawung klasik. Motif yang melambangkan kesucian dan keadilan.',
        price: 1200000,
        category: 'Fabric',
        sku: 'BK-KBKW-003',
        specs: {
          technique: 'Batik Tulis',
          origin: 'Yogyakarta',
          length: '2.5m',
        },
        weight: '400g',
        material: 'Sutra ATBM',
      },
    ],
  },
  {
    name: 'Kopi Nusantara',
    description:
      'Kopi specialty Indonesia dari berbagai daerah. Dari petani langsung ke cangkir Anda.',
    category: 'Food & Beverage',
    user: {
      email: 'admin@kopinusantara.co.id',
      password: 'kopi2024',
      name: 'Ahmad Fauzi',
    },
    products: [
      {
        name: 'Kopi Gayo Arabica Premium',
        description:
          'Biji kopi Arabica pilihan dari dataran tinggi Gayo, Aceh. Rasa wine, fruity dengan aroma earthy.',
        price: 185000,
        category: 'Coffee Beans',
        sku: 'KN-GAP-001',
        specs: {
          origin: 'Gayo, Aceh',
          altitude: '1400-1700m',
          process: 'Wet Hulled',
          roast: 'Medium',
        },
        weight: '250g',
      },
      {
        name: 'Kopi Toraja Sapan',
        description:
          'Single origin dari Toraja Utara. Notes cokelat, rempah dengan body yang full.',
        price: 165000,
        category: 'Coffee Beans',
        sku: 'KN-TRS-002',
        specs: {
          origin: 'Toraja, Sulawesi',
          altitude: '1500-1800m',
          process: 'Natural',
          roast: 'Medium-Dark',
        },
        weight: '250g',
      },
      {
        name: 'Kopi Kintamani Bali',
        description:
          'Kopi Arabica dari lereng Gunung Batur. Citrus, lemon dengan acidity yang bright.',
        price: 155000,
        category: 'Coffee Beans',
        sku: 'KN-KTB-003',
        specs: {
          origin: 'Kintamani, Bali',
          altitude: '1200-1600m',
          process: 'Washed',
          roast: 'Light-Medium',
        },
        weight: '250g',
      },
      {
        name: 'Drip Bag Coffee Mix Pack',
        description:
          'Paket 10 drip bag dengan 5 varian kopi Nusantara. Praktis untuk travel.',
        price: 95000,
        category: 'Drip Bag',
        sku: 'KN-DBM-004',
        specs: { contains: '10 sachets', varieties: '5 origins' },
        weight: '150g',
      },
    ],
  },
  {
    name: 'Sepatu Compass',
    description:
      'Brand sepatu lokal Indonesia dengan kualitas internasional. Sneakers dengan desain timeless.',
    category: 'Footwear',
    user: {
      email: 'brand@sepatucompass.id',
      password: 'compass2024',
      name: 'Budi Santoso',
    },
    products: [
      {
        name: 'Compass Gazelle Low Black',
        description:
          'Sneakers klasik dengan desain minimalis. Upper canvas premium dengan sole vulcanized.',
        price: 398000,
        category: 'Sneakers',
        sku: 'CP-GZL-BK01',
        specs: {
          sole: 'Rubber Vulcanized',
          upper: 'Canvas Premium',
          closure: 'Lace-up',
        },
        weight: '450g',
        size: '42',
        color: 'Black/White',
      },
      {
        name: 'Compass Retrograde High',
        description:
          'High-top sneakers dengan desain retro 80s. Cocok untuk daily wear.',
        price: 448000,
        category: 'Sneakers',
        sku: 'CP-RTG-HI02',
        specs: {
          sole: 'Rubber Gum',
          upper: 'Canvas + Suede',
          closure: 'Lace-up',
        },
        weight: '520g',
        size: '43',
        color: 'Navy/Cream',
      },
      {
        name: 'Compass Proto Low White',
        description:
          'All-white sneakers untuk tampilan clean. Limited edition collaboration series.',
        price: 498000,
        category: 'Sneakers',
        sku: 'CP-PRT-WH03',
        specs: {
          sole: 'Rubber White',
          upper: 'Leather Premium',
          closure: 'Lace-up',
          edition: 'Limited',
        },
        weight: '480g',
        size: '41',
        color: 'Triple White',
      },
    ],
  },
  {
    name: 'Jamu Iboe',
    description:
      'Jamu tradisional Indonesia sejak 1910. Warisan kesehatan leluhur dalam kemasan modern.',
    category: 'Health & Wellness',
    user: {
      email: 'marketing@jamuiboe.com',
      password: 'jamu2024',
      name: 'Dewi Kartika',
    },
    products: [
      {
        name: 'Jamu Kunyit Asam',
        description:
          'Jamu klasik untuk kesehatan pencernaan dan kecantikan kulit. Terbuat dari kunyit pilihan.',
        price: 15000,
        category: 'Traditional Herbal',
        sku: 'JI-KYA-001',
        specs: {
          ingredients: 'Kunyit, Asam Jawa',
          benefits: 'Digestive Health',
          form: 'Liquid',
        },
        weight: '150ml',
      },
      {
        name: 'Jamu Beras Kencur',
        description:
          'Jamu penambah nafsu makan dan penghilang pegal linu. Resep tradisional Jawa.',
        price: 15000,
        category: 'Traditional Herbal',
        sku: 'JI-BKC-002',
        specs: {
          ingredients: 'Beras, Kencur',
          benefits: 'Appetite Booster',
          form: 'Liquid',
        },
        weight: '150ml',
      },
      {
        name: 'Tolak Angin',
        description:
          'Jamu untuk masuk angin dan perut kembung. Dipercaya turun temurun.',
        price: 8000,
        category: 'Traditional Herbal',
        sku: 'JI-TLA-003',
        specs: {
          ingredients: 'Jahe, Madu, Mint',
          benefits: 'Cold Relief',
          form: 'Sachet',
        },
        weight: '15ml',
      },
      {
        name: 'Kapsul Temulawak',
        description:
          'Ekstrak temulawak dalam bentuk kapsul praktis. Untuk kesehatan liver.',
        price: 45000,
        category: 'Herbal Supplement',
        sku: 'JI-TML-004',
        specs: {
          ingredients: 'Temulawak Extract 500mg',
          form: 'Capsule',
          quantity: '30 caps',
        },
        weight: '50g',
      },
    ],
  },
  {
    name: 'Tas Nama',
    description:
      'Brand tas lokal dengan bahan ramah lingkungan. Desain fungsional untuk urban lifestyle.',
    category: 'Bags & Accessories',
    user: {
      email: 'hello@tasnama.id',
      password: 'nama2024',
      name: 'Rina Wijaya',
    },
    products: [
      {
        name: 'Backpack Voyager 25L',
        description:
          'Tas ransel untuk daily commute dengan laptop sleeve 15 inch. Water-resistant fabric.',
        price: 389000,
        category: 'Backpack',
        sku: 'TN-VYG-25L',
        specs: {
          capacity: '25L',
          laptop: 'Up to 15"',
          material: 'Recycled Polyester',
          waterproof: 'Water-resistant',
        },
        weight: '750g',
        color: 'Charcoal Grey',
      },
      {
        name: 'Tote Bag Canvas Classic',
        description:
          'Tote bag canvas tebal dengan inner pocket. Cocok untuk belanja dan jalan santai.',
        price: 159000,
        category: 'Tote Bag',
        sku: 'TN-TBC-001',
        specs: {
          material: 'Canvas 12oz',
          closure: 'Open Top',
          pockets: '1 inner, 1 outer',
        },
        weight: '350g',
        color: 'Natural/Brown',
      },
      {
        name: 'Sling Bag Mini',
        description:
          'Sling bag compact untuk membawa essentials. Tali adjustable dengan quick-release buckle.',
        price: 249000,
        category: 'Sling Bag',
        sku: 'TN-SLM-002',
        specs: {
          capacity: '2L',
          material: 'Cordura Nylon',
          closure: 'YKK Zipper',
        },
        weight: '220g',
        color: 'Black',
      },
    ],
  },
];

// ============================================================================
// DISTRIBUTION & LOCATION DATA
// ============================================================================

const DISTRIBUTION_REGIONS = [
  {
    region: 'Jawa',
    country: 'ID',
    channel: 'Official Store',
    market: 'Domestic',
  },
  {
    region: 'Sumatera',
    country: 'ID',
    channel: 'Authorized Retailer',
    market: 'Domestic',
  },
  {
    region: 'Kalimantan',
    country: 'ID',
    channel: 'Marketplace Partner',
    market: 'Domestic',
  },
  {
    region: 'Sulawesi',
    country: 'ID',
    channel: 'Distributor',
    market: 'Domestic',
  },
  {
    region: 'Bali & Nusa Tenggara',
    country: 'ID',
    channel: 'Retail Partner',
    market: 'Domestic',
  },
  {
    region: 'Southeast Asia',
    country: 'SG',
    channel: 'Export Partner',
    market: 'Export',
  },
  {
    region: 'Asia Pacific',
    country: 'MY',
    channel: 'Regional Distributor',
    market: 'Export',
  },
];

const INDONESIAN_LOCATIONS = [
  {
    name: 'Jakarta Pusat, DKI Jakarta',
    lat: -6.1751,
    lng: 106.865,
    country: 'ID',
  },
  { name: 'Surabaya, Jawa Timur', lat: -7.2575, lng: 112.7521, country: 'ID' },
  { name: 'Bandung, Jawa Barat', lat: -6.9175, lng: 107.6191, country: 'ID' },
  { name: 'Medan, Sumatera Utara', lat: 3.5952, lng: 98.6722, country: 'ID' },
  { name: 'Semarang, Jawa Tengah', lat: -6.9666, lng: 110.4196, country: 'ID' },
  {
    name: 'Makassar, Sulawesi Selatan',
    lat: -5.1477,
    lng: 119.4327,
    country: 'ID',
  },
  { name: 'Yogyakarta, DIY', lat: -7.7956, lng: 110.3695, country: 'ID' },
  { name: 'Denpasar, Bali', lat: -8.6705, lng: 115.2126, country: 'ID' },
  {
    name: 'Palembang, Sumatera Selatan',
    lat: -2.9761,
    lng: 104.7754,
    country: 'ID',
  },
  {
    name: 'Balikpapan, Kalimantan Timur',
    lat: -1.2379,
    lng: 116.8529,
    country: 'ID',
  },
  { name: 'Malang, Jawa Timur', lat: -7.9666, lng: 112.6326, country: 'ID' },
  { name: 'Solo, Jawa Tengah', lat: -7.5755, lng: 110.8243, country: 'ID' },
];

const SUSPICIOUS_LOCATIONS = [
  { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, country: 'NG' },
  { name: 'Shenzhen, China', lat: 22.5431, lng: 114.0579, country: 'CN' },
  { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6173, country: 'RU' },
  { name: 'Mumbai, India', lat: 19.076, lng: 72.8777, country: 'IN' },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, country: 'AE' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCode(prefix: string, length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateHashTx(): string {
  const chars = 'abcdef0123456789';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

function generateFingerprint(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let fp = '';
  for (let i = 0; i < 32; i++) {
    fp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return fp;
}

function generateIP(): string {
  return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Xiaomi 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

const BOT_USER_AGENTS = [
  'python-requests/2.28.0',
  'curl/7.84.0',
  'Java/1.8.0_321',
  'Go-http-client/1.1',
];

// ============================================================================
// QR CODE GENERATION
// ============================================================================

async function generateQRCodeBuffer(tagCode: string): Promise<Buffer> {
  return QRCode.toBuffer(tagCode, {
    type: 'png',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}

async function uploadTagAssets(
  tagCode: string,
  metadata: object
): Promise<{ qrUrl: string; metadataUrl: string } | null> {
  if (!UPLOAD_TO_R2 || !uploadFile || !getFileUrl) {
    return null;
  }

  try {
    // Generate and upload QR code
    const qrBuffer = await generateQRCodeBuffer(tagCode);
    const qrKey = `tags/${tagCode}/qr-code.png`;
    await uploadFile(qrKey, qrBuffer, 'image/png');
    const qrUrl = getFileUrl(qrKey);

    // Upload metadata JSON
    const metadataBuffer = Buffer.from(
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
    const metadataKey = `tags/${tagCode}/metadata.json`;
    await uploadFile(metadataKey, metadataBuffer, 'application/json');
    const metadataUrl = getFileUrl(metadataKey);

    return { qrUrl, metadataUrl };
  } catch (error) {
    console.error(`Failed to upload assets for ${tagCode}:`, error);
    return null;
  }
}

// ============================================================================
// SUSPICIOUS SCAN PATTERNS
// ============================================================================

type ScanData = {
  fingerprint_id: string;
  ip_address: string;
  user_agent: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  is_claimed: number;
  is_first_hand: number | null;
  source_info: string | null;
  scan_number: number;
  created_at: Date;
};

type FraudPattern = {
  name: string;
  description: string;
  generateScans: () => ScanData[];
};

const FRAUD_PATTERNS: FraudPattern[] = [
  {
    name: 'impossible_travel',
    description: 'Same device in Jakarta and Shenzhen within 2 hours',
    generateScans: () => {
      const fingerprint = generateFingerprint();
      return [
        {
          fingerprint_id: fingerprint,
          ip_address: generateIP(),
          user_agent: randomElement(USER_AGENTS),
          latitude: -6.1751,
          longitude: 106.865,
          location_name: 'Jakarta Pusat, DKI Jakarta',
          is_claimed: 1,
          is_first_hand: 1,
          source_info: null,
          scan_number: 1,
          created_at: hoursAgo(3),
        },
        {
          fingerprint_id: fingerprint, // Same device!
          ip_address: generateIP(),
          user_agent: randomElement(USER_AGENTS),
          latitude: 22.5431,
          longitude: 114.0579,
          location_name: 'Shenzhen, China',
          is_claimed: 0,
          is_first_hand: null,
          source_info: null,
          scan_number: 2,
          created_at: hoursAgo(1),
        },
      ];
    },
  },
  {
    name: 'high_volume_single_device',
    description: '40+ scans from same device in 24 hours',
    generateScans: () => {
      const fingerprint = generateFingerprint();
      const ip = generateIP();
      const location = randomElement(INDONESIAN_LOCATIONS);
      const scans: ScanData[] = [];

      for (let i = 0; i < randomInt(35, 50); i++) {
        scans.push({
          fingerprint_id: fingerprint,
          ip_address: ip,
          user_agent: randomElement(USER_AGENTS),
          latitude: location.lat + (Math.random() - 0.5) * 0.01,
          longitude: location.lng + (Math.random() - 0.5) * 0.01,
          location_name: location.name,
          is_claimed: i === 0 ? 1 : 0,
          is_first_hand: i === 0 ? 1 : null,
          source_info: null,
          scan_number: i + 1,
          created_at: hoursAgo(randomInt(1, 24)),
        });
      }
      return scans;
    },
  },
  {
    name: 'multiple_claim_attempts',
    description: 'Multiple devices attempting to claim same tag',
    generateScans: () => {
      const scans: ScanData[] = [];
      for (let i = 0; i < randomInt(4, 7); i++) {
        const location = randomElement(INDONESIAN_LOCATIONS);
        scans.push({
          fingerprint_id: generateFingerprint(), // Different device each time
          ip_address: generateIP(),
          user_agent: randomElement(USER_AGENTS),
          latitude: location.lat,
          longitude: location.lng,
          location_name: location.name,
          is_claimed: 1, // All trying to claim!
          is_first_hand: Math.random() > 0.5 ? 1 : 0,
          source_info: randomElement([
            'Tokopedia',
            'Shopee',
            'Facebook',
            'Teman',
            'Pasar',
          ]),
          scan_number: i + 1,
          created_at: daysAgo(randomInt(0, 5)),
        });
      }
      return scans;
    },
  },
  {
    name: 'location_mismatch',
    description: 'Product for Indonesia market scanned in Nigeria',
    generateScans: () => {
      const location = SUSPICIOUS_LOCATIONS[0]; // Lagos
      return [
        {
          fingerprint_id: generateFingerprint(),
          ip_address: generateIP(),
          user_agent: randomElement(USER_AGENTS),
          latitude: location.lat,
          longitude: location.lng,
          location_name: location.name,
          is_claimed: 1,
          is_first_hand: 0,
          source_info: 'Bought from local market',
          scan_number: 1,
          created_at: daysAgo(randomInt(5, 20)),
        },
        {
          fingerprint_id: generateFingerprint(),
          ip_address: generateIP(),
          user_agent: randomElement(USER_AGENTS),
          latitude: location.lat + 0.01,
          longitude: location.lng + 0.01,
          location_name: location.name,
          is_claimed: 0,
          is_first_hand: null,
          source_info: null,
          scan_number: 2,
          created_at: daysAgo(randomInt(0, 3)),
        },
      ];
    },
  },
  {
    name: 'bot_like_behavior',
    description: 'Rapid automated scans with bot user-agent',
    generateScans: () => {
      const fingerprint = generateFingerprint();
      const scans: ScanData[] = [];

      for (let i = 0; i < randomInt(15, 25); i++) {
        scans.push({
          fingerprint_id: fingerprint,
          ip_address: generateIP(),
          user_agent: randomElement(BOT_USER_AGENTS),
          latitude: null, // Bots often don't have location
          longitude: null,
          location_name: null,
          is_claimed: 0,
          is_first_hand: null,
          source_info: null,
          scan_number: i + 1,
          created_at: minutesAgo(i * 2), // Every 2 minutes
        });
      }
      return scans;
    },
  },
  {
    name: 'rapid_location_change',
    description: 'Multiple cities in Indonesia within hours',
    generateScans: () => {
      const fingerprint = generateFingerprint();
      const locations = [
        INDONESIAN_LOCATIONS[0], // Jakarta
        INDONESIAN_LOCATIONS[1], // Surabaya
        INDONESIAN_LOCATIONS[7], // Denpasar
      ];

      return locations.map((loc, i) => ({
        fingerprint_id: fingerprint,
        ip_address: generateIP(),
        user_agent: randomElement(USER_AGENTS),
        latitude: loc.lat,
        longitude: loc.lng,
        location_name: loc.name,
        is_claimed: i === 0 ? 1 : 0,
        is_first_hand: i === 0 ? 1 : null,
        source_info: null,
        scan_number: i + 1,
        created_at: hoursAgo(6 - i * 2), // 2 hours apart
      }));
    },
  },
];

// ============================================================================
// LEGITIMATE SCAN PATTERN
// ============================================================================

function generateLegitimateScans(
  numScans: number,
  distribution: (typeof DISTRIBUTION_REGIONS)[0]
): ScanData[] {
  const scans: ScanData[] = [];
  const claimerFingerprint = generateFingerprint();

  // Get appropriate locations based on distribution region
  const locations = INDONESIAN_LOCATIONS.filter((loc) => {
    if (distribution.region === 'Jawa') {
      return (
        loc.name.includes('Jakarta') ||
        loc.name.includes('Jawa') ||
        loc.name.includes('Yogyakarta')
      );
    }
    if (distribution.region === 'Bali & Nusa Tenggara') {
      return loc.name.includes('Bali');
    }
    return true;
  });

  for (let i = 0; i < numScans; i++) {
    const location = randomElement(locations);
    const isClaim = i === 0;

    scans.push({
      fingerprint_id: isClaim ? claimerFingerprint : generateFingerprint(),
      ip_address: generateIP(),
      user_agent: randomElement(USER_AGENTS),
      latitude: location.lat + (Math.random() - 0.5) * 0.05,
      longitude: location.lng + (Math.random() - 0.5) * 0.05,
      location_name: location.name,
      is_claimed: isClaim ? 1 : 0,
      is_first_hand: isClaim ? 1 : null,
      source_info: isClaim
        ? randomElement([
            'Official Store',
            'Tokopedia Official',
            'Shopee Mall',
            null,
          ])
        : null,
      scan_number: i + 1,
      created_at: daysAgo(randomInt(1, 60)),
    });
  }

  return scans.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('========================================');
  console.log('  ETAGS COMPLETE DATABASE SEEDING');
  console.log('========================================\n');

  console.log('Options:');
  console.log(`  - Upload to R2: ${UPLOAD_TO_R2 ? 'YES' : 'NO'}`);
  console.log(`  - Clean data: ${CLEAN_DATA ? 'YES' : 'NO'}`);
  console.log('');

  await initR2();

  // Clean existing data if requested
  if (CLEAN_DATA) {
    console.log('Cleaning existing data...');
    await prisma.tagScan.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany({ where: { role: 'brand' } });
    await prisma.brand.deleteMany();
    console.log('Existing data cleaned.\n');
  }

  let totalBrands = 0;
  let totalUsers = 0;
  let totalProducts = 0;
  let totalTags = 0;
  let totalScans = 0;
  let suspiciousTags = 0;

  // Placeholder image service
  const getPlaceholderImage = (
    seed: string,
    width: number = 400,
    height: number = 400
  ) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

  // Create brands with users, products, and tags
  for (const brandData of BRANDS) {
    console.log(`\nCreating brand: ${brandData.name}`);

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name: brandData.name,
        descriptions: brandData.description,
        logo_url: getPlaceholderImage(
          brandData.name.toLowerCase().replace(/\s/g, '-'),
          200,
          200
        ),
        status: 1,
      },
    });
    totalBrands++;

    // Create brand user
    const hashedPassword = await bcrypt.hash(brandData.user.password, 10);
    const user = await prisma.user.create({
      data: {
        name: brandData.user.name,
        email: brandData.user.email,
        password: hashedPassword,
        role: 'brand',
        status: 1,
        brand_id: brand.id,
        onboarding_complete: 1,
      },
    });
    totalUsers++;
    console.log(`  User: ${user.email}`);

    // Create products
    for (const productData of brandData.products) {
      const productCode = generateCode('PRD-');

      const product = await prisma.product.create({
        data: {
          code: productCode,
          brand_id: brand.id,
          status: 1,
          metadata: {
            _template: 'generic',
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            sku: productData.sku,
            specifications: productData.specs,
            weight: productData.weight,
            color: productData.color,
            color_name: productData.color,
            size: productData.size,
            material: productData.material,
            images: [
              getPlaceholderImage(`${productCode}-1`),
              getPlaceholderImage(`${productCode}-2`),
              getPlaceholderImage(`${productCode}-3`),
            ],
          },
        },
      });
      totalProducts++;

      // Create 2-4 tags per product
      const numTags = randomInt(2, 4);
      for (let t = 0; t < numTags; t++) {
        const tagCode = generateCode('TAG-', 10);
        const distribution = randomElement(DISTRIBUTION_REGIONS);

        // Determine if this tag will be suspicious (15% chance)
        const isSuspicious = Math.random() < 0.15;
        const fraudPattern = isSuspicious
          ? randomElement(FRAUD_PATTERNS)
          : null;

        // Determine tag status
        const isStamped = Math.random() > 0.1; // 90% stamped
        const chainStatus = isStamped
          ? isSuspicious
            ? 4 // FLAGGED
            : randomElement([1, 1, 1, 2, 2, 2, 2, 3]) // Mostly DISTRIBUTED or CLAIMED
          : 0;

        const tagMetadata = {
          notes: `Tag for ${productData.name}`,
          batch_number: generateCode('BATCH-', 6),
          manufacture_date: daysAgo(randomInt(30, 180))
            .toISOString()
            .split('T')[0],
          distribution_region: distribution.region,
          distribution_country: distribution.country,
          distribution_channel: distribution.channel,
          intended_market: distribution.market,
        };

        const tag = await prisma.tag.create({
          data: {
            code: tagCode,
            product_ids: [product.id],
            metadata: tagMetadata,
            is_stamped: isStamped ? 1 : 0,
            publish_status: 1,
            chain_status: chainStatus,
            hash_tx: isStamped ? generateHashTx() : null,
          },
        });
        totalTags++;

        // Upload to R2 if enabled
        if (UPLOAD_TO_R2 && isStamped) {
          const fullMetadata = {
            version: '1.0',
            tag: {
              code: tagCode,
              created_at: tag.created_at.toISOString(),
              stamped_at: new Date().toISOString(),
              metadata: tagMetadata,
            },
            products: [
              {
                id: product.id,
                code: product.code,
                name: productData.name,
                description: productData.description,
                images: [],
                brand: {
                  id: brand.id,
                  name: brand.name,
                  logo_url: brand.logo_url,
                },
              },
            ],
            distribution: {
              region: distribution.region,
              country: distribution.country,
              channel: distribution.channel,
              intended_market: distribution.market,
            },
            verification: {
              qr_code_url: '',
              verify_url: `https://etags.app/verify/${tagCode}`,
              blockchain: {
                network: 'Base Sepolia',
                chain_id: 84532,
                contract_address: process.env.CONTRACT_ADDRESS || '0x...',
                transaction_hash: tag.hash_tx,
              },
            },
          };

          await uploadTagAssets(tagCode, fullMetadata);
        }

        // Generate scans
        if (chainStatus >= 1) {
          const scans =
            isSuspicious && fraudPattern
              ? fraudPattern.generateScans()
              : generateLegitimateScans(randomInt(1, 5), distribution);

          for (const scanData of scans) {
            await prisma.tagScan.create({
              data: {
                tag_id: tag.id,
                ...scanData,
              },
            });
            totalScans++;
          }

          if (isSuspicious) {
            suspiciousTags++;
            console.log(`    [SUSPICIOUS] ${tagCode}: ${fraudPattern?.name}`);
          }
        }
      }
    }
    console.log(`  Products: ${brandData.products.length}, Tags created`);
  }

  // Create admin user if not exists
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@etags.app' },
  });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash('admin2024', 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@etags.app',
        password: adminPassword,
        role: 'admin',
        status: 1,
        onboarding_complete: 1,
      },
    });
    console.log('\nAdmin user created: admin@etags.app / admin2024');
  }

  // Summary
  console.log('\n========================================');
  console.log('  SEEDING COMPLETE!');
  console.log('========================================');
  console.log(`\n  Brands:          ${totalBrands}`);
  console.log(`  Brand Users:     ${totalUsers}`);
  console.log(`  Products:        ${totalProducts}`);
  console.log(`  Tags:            ${totalTags}`);
  console.log(`  Scans:           ${totalScans}`);
  console.log(
    `  Suspicious Tags: ${suspiciousTags} (flagged for AI detection)`
  );

  if (UPLOAD_TO_R2) {
    console.log('\n  R2 Assets uploaded for stamped tags');
  }

  console.log('\n  Brand User Credentials:');
  for (const brand of BRANDS) {
    console.log(`    - ${brand.user.email} / ${brand.user.password}`);
  }

  // Tag status distribution
  console.log('\n  Tag Status Distribution:');
  const statusCounts = await prisma.tag.groupBy({
    by: ['chain_status'],
    _count: true,
  });

  const STATUS_NAMES = [
    'CREATED',
    'DISTRIBUTED',
    'CLAIMED',
    'TRANSFERRED',
    'FLAGGED',
    'REVOKED',
  ];
  for (const stat of statusCounts) {
    const statusName = STATUS_NAMES[stat.chain_status ?? 0] || 'UNKNOWN';
    console.log(`    ${statusName}: ${stat._count}`);
  }
}

main()
  .catch((e) => {
    console.error('\nSeeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
