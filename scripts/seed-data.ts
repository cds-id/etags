import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Placeholder image services
const PLACEHOLDER = {
  logo: (seed: string) => `https://picsum.photos/seed/${seed}/200/200`,
  product: (seed: string) => `https://picsum.photos/seed/${seed}/400/400`,
  banner: (seed: string) => `https://picsum.photos/seed/${seed}/800/400`,
};

// Sample brand data for various industries
const BRANDS_DATA = [
  {
    name: 'Nike Indonesia',
    description:
      'Brand sepatu dan pakaian olahraga terkemuka dunia. Menyediakan produk berkualitas tinggi untuk atlet dan pecinta olahraga.',
    category: 'Sports & Fashion',
  },
  {
    name: 'Samsung Electronics',
    description:
      'Perusahaan elektronik multinasional Korea Selatan. Memproduksi smartphone, TV, dan peralatan rumah tangga.',
    category: 'Electronics',
  },
  {
    name: 'Wardah Cosmetics',
    description:
      'Brand kosmetik halal Indonesia. Menyediakan produk skincare dan makeup berkualitas untuk wanita Indonesia.',
    category: 'Beauty & Cosmetics',
  },
  {
    name: 'Eiger Adventure',
    description:
      'Brand outdoor dan adventure gear Indonesia. Menyediakan tas, sepatu, dan perlengkapan outdoor.',
    category: 'Outdoor & Adventure',
  },
  {
    name: 'Polytron',
    description:
      'Perusahaan elektronik Indonesia. Memproduksi TV, audio system, dan peralatan rumah tangga.',
    category: 'Electronics',
  },
  {
    name: 'Erigo Store',
    description:
      'Brand fashion lokal Indonesia. Menyediakan pakaian casual dan streetwear untuk anak muda.',
    category: 'Fashion',
  },
  {
    name: 'Kopi Kapal Api',
    description:
      'Brand kopi legendaris Indonesia. Menyediakan berbagai varian kopi bubuk dan kopi instan.',
    category: 'Food & Beverage',
  },
  {
    name: 'Aqua',
    description:
      'Brand air mineral terkemuka Indonesia. Menyediakan air minum berkualitas dalam berbagai kemasan.',
    category: 'Food & Beverage',
  },
  {
    name: 'Brompton Indonesia',
    description:
      'Brand sepeda lipat premium dari Inggris. Menyediakan sepeda lipat berkualitas tinggi untuk mobilitas urban.',
    category: 'Transportation',
  },
  {
    name: 'HMNS Perfume',
    description:
      'Brand parfum lokal Indonesia. Menyediakan parfum dengan aroma unik dan harga terjangkau.',
    category: 'Beauty & Fragrance',
  },
];

// Product templates per category
const PRODUCT_TEMPLATES: Record<
  string,
  Array<{
    nameTemplate: string;
    variants: string[];
    priceRange: [number, number];
    specs: Record<string, string>;
  }>
> = {
  'Sports & Fashion': [
    {
      nameTemplate: 'Air Max {variant}',
      variants: ['90', '95', '97', '270', '720'],
      priceRange: [1500000, 3500000],
      specs: {
        material: 'Mesh + Leather',
        sole: 'Air cushion',
        weight: '350g',
      },
    },
    {
      nameTemplate: 'Dri-FIT {variant} Jersey',
      variants: ['Pro', 'Elite', 'Academy', 'Strike'],
      priceRange: [400000, 900000],
      specs: {
        material: 'Polyester Dri-FIT',
        fit: 'Regular',
        technology: 'Moisture-wicking',
      },
    },
    {
      nameTemplate: 'Running Shorts {variant}',
      variants: ['7"', '5"', '3"', 'Flex'],
      priceRange: [300000, 600000],
      specs: {
        material: 'Recycled polyester',
        feature: 'Built-in brief',
        pocket: 'Zippered',
      },
    },
  ],
  Electronics: [
    {
      nameTemplate: 'Galaxy {variant}',
      variants: ['S24 Ultra', 'S24+', 'S24', 'A54', 'A34'],
      priceRange: [4000000, 22000000],
      specs: { display: 'Dynamic AMOLED', camera: '200MP', battery: '5000mAh' },
    },
    {
      nameTemplate: 'Smart TV {variant}"',
      variants: ['43', '50', '55', '65', '75'],
      priceRange: [4500000, 25000000],
      specs: { resolution: '4K UHD', panel: 'QLED', os: 'Tizen' },
    },
    {
      nameTemplate: 'Galaxy Buds {variant}',
      variants: ['Pro 2', 'FE', 'Live', '2'],
      priceRange: [800000, 3500000],
      specs: { driver: '11mm', anc: 'Intelligent ANC', battery: '8h playback' },
    },
  ],
  'Beauty & Cosmetics': [
    {
      nameTemplate: 'Lightening {variant} Cream',
      variants: ['Day', 'Night', 'BB', 'CC'],
      priceRange: [35000, 85000],
      specs: {
        size: '20ml',
        spf: 'SPF 30',
        ingredients: 'Niacinamide, Vitamin C',
      },
    },
    {
      nameTemplate: 'Exclusive Lipstick {variant}',
      variants: ['Matte', 'Velvet', 'Creamy', 'Long-lasting'],
      priceRange: [55000, 95000],
      specs: { finish: 'Matte', weight: '3.5g', coverage: 'Full' },
    },
    {
      nameTemplate: 'Perfect Bright {variant}',
      variants: ['Serum', 'Essence', 'Toner', 'Moisturizer'],
      priceRange: [45000, 120000],
      specs: { size: '35ml', type: 'Water-based', benefit: 'Brightening' },
    },
  ],
  'Outdoor & Adventure': [
    {
      nameTemplate: 'Carrier {variant}L',
      variants: ['45', '60', '75', '90'],
      priceRange: [800000, 2500000],
      specs: {
        material: 'Ripstop Nylon',
        frame: 'Aluminum',
        waterproof: 'Yes',
      },
    },
    {
      nameTemplate: 'Hiking Boots {variant}',
      variants: ['Trail', 'Summit', 'Explorer', 'Ranger'],
      priceRange: [600000, 1800000],
      specs: {
        material: 'Leather + Gore-Tex',
        sole: 'Vibram',
        ankle: 'High support',
      },
    },
    {
      nameTemplate: 'Tent {variant} Person',
      variants: ['2', '4', '6', '8'],
      priceRange: [500000, 3000000],
      specs: {
        material: 'Polyester',
        poles: 'Fiberglass',
        waterproof: '3000mm',
      },
    },
  ],
  Fashion: [
    {
      nameTemplate: 'Basic Tee {variant}',
      variants: ['White', 'Black', 'Navy', 'Grey', 'Cream'],
      priceRange: [89000, 159000],
      specs: { material: 'Cotton 100%', fit: 'Regular', gsm: '180' },
    },
    {
      nameTemplate: 'Hoodie {variant} Edition',
      variants: ['Classic', 'Oversized', 'Cropped', 'Zip-up'],
      priceRange: [250000, 450000],
      specs: {
        material: 'Cotton Fleece',
        hood: 'Drawstring',
        pocket: 'Kangaroo',
      },
    },
    {
      nameTemplate: 'Cargo Pants {variant}',
      variants: ['Regular', 'Slim', 'Wide', 'Jogger'],
      priceRange: [289000, 489000],
      specs: {
        material: 'Cotton Twill',
        pockets: '6',
        closure: 'Button + Zip',
      },
    },
  ],
  'Food & Beverage': [
    {
      nameTemplate: 'Kopi {variant}',
      variants: ['Special', 'Susu', 'Gula Aren', 'Mix', 'Tubruk'],
      priceRange: [15000, 45000],
      specs: { weight: '165g', type: 'Ground coffee', origin: 'Lampung' },
    },
    {
      nameTemplate: 'Mineral Water {variant}ml',
      variants: ['330', '600', '1500', '6000'],
      priceRange: [3000, 25000],
      specs: { source: 'Mountain spring', ph: '7.0', minerals: 'Natural' },
    },
  ],
  Transportation: [
    {
      nameTemplate: 'Brompton {variant} Line',
      variants: ['C', 'A', 'P', 'T', 'S'],
      priceRange: [28000000, 45000000],
      specs: { frame: 'Steel', gears: '6-speed', folded: '585x565x270mm' },
    },
  ],
  'Beauty & Fragrance': [
    {
      nameTemplate: 'Eau de Parfum {variant}',
      variants: ['Fresh', 'Woody', 'Floral', 'Oriental', 'Citrus'],
      priceRange: [150000, 350000],
      specs: { size: '100ml', concentration: 'EDP', longevity: '8-10 hours' },
    },
  ],
};

// Tag status distribution for realistic data
const TAG_STATUSES = [
  { chain_status: 0, publish_status: 0, is_stamped: 0, weight: 5 }, // Created, draft
  { chain_status: 0, publish_status: 1, is_stamped: 1, weight: 10 }, // Created, published, stamped
  { chain_status: 1, publish_status: 1, is_stamped: 1, weight: 30 }, // Distributed
  { chain_status: 2, publish_status: 1, is_stamped: 1, weight: 40 }, // Claimed
  { chain_status: 3, publish_status: 1, is_stamped: 1, weight: 10 }, // Transferred
  { chain_status: 4, publish_status: 1, is_stamped: 1, weight: 3 }, // Flagged
  { chain_status: 5, publish_status: 1, is_stamped: 1, weight: 2 }, // Revoked
];

// Distribution locations for realistic scan data
const LOCATIONS = [
  { name: 'Jakarta Pusat', lat: -6.1751, lng: 106.865 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan', lat: 3.5952, lng: 98.6722 },
  { name: 'Semarang', lat: -6.9666, lng: 110.4196 },
  { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
  { name: 'Palembang', lat: -2.9761, lng: 104.7754 },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Denpasar', lat: -8.6705, lng: 115.2126 },
  { name: 'Balikpapan', lat: -1.2379, lng: 116.8529 },
];

// Helper functions
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

function weightedRandom<T>(items: Array<T & { weight: number }>): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
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

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; SM-A546B) AppleWebKit/537.36',
];

async function main() {
  console.log('🌱 Starting database seeding...\n');

  const productsPerBrand = parseInt(process.argv[2]) || 5;
  const tagsPerProduct = parseInt(process.argv[3]) || 3;
  const scansPerTag = parseInt(process.argv[4]) || 2;

  console.log(`Configuration:`);
  console.log(`  - Brands: ${BRANDS_DATA.length}`);
  console.log(`  - Products per brand: ${productsPerBrand}`);
  console.log(`  - Tags per product: ${tagsPerProduct}`);
  console.log(`  - Scans per tag: ${scansPerTag}`);
  console.log('');

  let totalBrands = 0;
  let totalProducts = 0;
  let totalTags = 0;
  let totalScans = 0;

  for (const brandData of BRANDS_DATA) {
    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name: brandData.name,
        descriptions: brandData.description,
        logo_url: PLACEHOLDER.logo(
          brandData.name.toLowerCase().replace(/\s/g, '-')
        ),
        status: 1,
      },
    });
    totalBrands++;
    console.log(`✅ Created brand: ${brand.name}`);

    // Get product templates for this category
    const templates =
      PRODUCT_TEMPLATES[brandData.category] || PRODUCT_TEMPLATES['Fashion'];

    // Create products for this brand
    for (let p = 0; p < productsPerBrand; p++) {
      const template = templates[p % templates.length];
      const variant = randomElement(template.variants);
      const productName = template.nameTemplate.replace('{variant}', variant);
      const productCode = generateCode('PRD-');
      const price = randomInt(template.priceRange[0], template.priceRange[1]);

      const product = await prisma.product.create({
        data: {
          code: productCode,
          brand_id: brand.id,
          status: 1,
          metadata: {
            name: productName,
            description: `${productName} dari ${brand.name}. Produk berkualitas tinggi dengan standar internasional.`,
            price: price,
            currency: 'IDR',
            images: [
              PLACEHOLDER.product(`${productCode}-1`),
              PLACEHOLDER.product(`${productCode}-2`),
              PLACEHOLDER.product(`${productCode}-3`),
            ],
            category: brandData.category,
            specifications: template.specs,
            sku: generateCode('SKU-', 6),
            weight: `${randomInt(100, 2000)}g`,
            dimensions: `${randomInt(10, 50)}x${randomInt(10, 50)}x${randomInt(5, 30)}cm`,
            warranty: `${randomInt(1, 24)} bulan`,
            manufacturing_date: new Date(
              Date.now() - randomInt(30, 365) * 24 * 60 * 60 * 1000
            ).toISOString(),
            batch_number: generateCode('BATCH-', 6),
          },
        },
      });
      totalProducts++;

      // Create tags for this product
      for (let t = 0; t < tagsPerProduct; t++) {
        const tagCode = generateCode('TAG-', 10);
        const status = weightedRandom(TAG_STATUSES);

        const tag = await prisma.tag.create({
          data: {
            code: tagCode,
            product_ids: [product.id],
            is_stamped: status.is_stamped,
            publish_status: status.publish_status,
            chain_status: status.chain_status,
            hash_tx: status.is_stamped ? generateHashTx() : null,
            metadata: {
              product_name: productName,
              brand_name: brand.name,
              generated_at: new Date().toISOString(),
              qr_version: '2.0',
              template: randomElement(['standard', 'premium', 'minimal']),
              distribution_channel: randomElement([
                'Online Store',
                'Retail Partner',
                'Direct Sales',
                'Marketplace',
              ]),
              region: randomElement([
                'Jakarta',
                'Jawa Barat',
                'Jawa Timur',
                'Sumatera',
                'Kalimantan',
                'Sulawesi',
                'Bali',
              ]),
            },
          },
        });
        totalTags++;

        // Create scans for claimed/transferred tags
        if (status.chain_status >= 2) {
          const numScans = randomInt(1, scansPerTag);
          for (let s = 0; s < numScans; s++) {
            const location = randomElement(LOCATIONS);
            const isClaimed = s === 0 && status.chain_status >= 2;

            await prisma.tagScan.create({
              data: {
                tag_id: tag.id,
                fingerprint_id: generateFingerprint(),
                ip_address: generateIP(),
                user_agent: randomElement(USER_AGENTS),
                latitude: location.lat + (Math.random() - 0.5) * 0.1,
                longitude: location.lng + (Math.random() - 0.5) * 0.1,
                location_name: location.name,
                is_claimed: isClaimed ? 1 : 0,
                is_first_hand: isClaimed ? (Math.random() > 0.3 ? 1 : 0) : null,
                source_info:
                  isClaimed && Math.random() > 0.7 ? 'Tokopedia' : null,
                scan_number: s + 1,
                created_at: new Date(
                  Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000
                ),
              },
            });
            totalScans++;
          }
        }
      }
    }
  }

  console.log('\n✨ Seeding completed!');
  console.log(`   📦 Brands: ${totalBrands}`);
  console.log(`   📦 Products: ${totalProducts}`);
  console.log(`   🏷️  Tags: ${totalTags}`);
  console.log(`   📱 Scans: ${totalScans}`);

  // Generate summary for AI dataset
  console.log('\n📊 Dataset Summary for AI Training:');
  console.log('─'.repeat(50));

  const brandStats = await prisma.brand.count();
  const productStats = await prisma.product.count();
  const tagStats = await prisma.tag.groupBy({
    by: ['chain_status'],
    _count: true,
  });
  const scanStats = await prisma.tagScan.count();

  console.log(`Total Brands: ${brandStats}`);
  console.log(`Total Products: ${productStats}`);
  console.log(`Total Tags: ${await prisma.tag.count()}`);
  console.log(`Total Scans: ${scanStats}`);
  console.log('\nTag Status Distribution:');
  for (const stat of tagStats) {
    const statusName = [
      'CREATED',
      'DISTRIBUTED',
      'CLAIMED',
      'TRANSFERRED',
      'FLAGGED',
      'REVOKED',
    ][stat.chain_status ?? 0];
    console.log(`  ${statusName}: ${stat._count}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
