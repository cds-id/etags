import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fraud patterns for realistic suspicious activity
const FRAUD_PATTERNS = {
  // Pattern 1: Multiple scans from different locations in short time (impossible travel)
  IMPOSSIBLE_TRAVEL: 'impossible_travel',
  // Pattern 2: High volume scans from single fingerprint
  HIGH_VOLUME_SINGLE_DEVICE: 'high_volume_single_device',
  // Pattern 3: Scans from known VPN/proxy IPs
  VPN_PROXY_USAGE: 'vpn_proxy_usage',
  // Pattern 4: Multiple claims on same tag from different devices
  MULTIPLE_CLAIMS: 'multiple_claims',
  // Pattern 5: Scan location far from distribution region
  LOCATION_MISMATCH: 'location_mismatch',
  // Pattern 6: Rapid sequential scans (bot behavior)
  BOT_LIKE_BEHAVIOR: 'bot_like_behavior',
  // Pattern 7: Scans from suspicious countries
  SUSPICIOUS_ORIGIN: 'suspicious_origin',
};

// Legitimate Indonesian locations
const LEGITIMATE_LOCATIONS = [
  { name: 'Jakarta Pusat', lat: -6.1751, lng: 106.865, country: 'ID' },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521, country: 'ID' },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191, country: 'ID' },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695, country: 'ID' },
  { name: 'Denpasar', lat: -8.6705, lng: 115.2126, country: 'ID' },
];

// Suspicious locations (far from Indonesia distribution)
const SUSPICIOUS_LOCATIONS = [
  { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, country: 'NG' },
  { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6173, country: 'RU' },
  { name: 'Unknown Location', lat: 0, lng: 0, country: 'XX' },
  { name: 'Shenzen, China', lat: 22.5431, lng: 114.0579, country: 'CN' },
  { name: 'Mumbai, India', lat: 19.076, lng: 72.8777, country: 'IN' },
];

// VPN/Proxy IP ranges (simulated)
const VPN_IP_PREFIXES = ['104.238', '45.33', '198.12', '173.199', '192.241'];

// Bot-like user agents
const BOT_USER_AGENTS = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'python-requests/2.28.0',
  'curl/7.84.0',
  'Java/1.8.0_321',
  'Go-http-client/1.1',
];

// Normal user agents
const NORMAL_USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
];

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFingerprint(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let fp = '';
  for (let i = 0; i < 32; i++) {
    fp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return fp;
}

function generateIP(isVpn: boolean = false): string {
  if (isVpn) {
    const prefix = randomElement(VPN_IP_PREFIXES);
    return `${prefix}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
  }
  return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60 * 1000);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

interface FraudScanData {
  pattern: string;
  description: string;
  scans: Array<{
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
  }>;
}

// Generate fraud patterns for a specific tag
function generateImpossibleTravelFraud(): FraudScanData {
  const fingerprint = generateFingerprint();
  const locations = [
    LEGITIMATE_LOCATIONS[0], // Jakarta
    SUSPICIOUS_LOCATIONS[3], // Shenzen (4000+ km away)
  ];

  return {
    pattern: FRAUD_PATTERNS.IMPOSSIBLE_TRAVEL,
    description:
      'Same device scanned in Jakarta and Shenzen within 2 hours - physically impossible',
    scans: [
      {
        fingerprint_id: fingerprint,
        ip_address: generateIP(),
        user_agent: randomElement(NORMAL_USER_AGENTS),
        latitude: locations[0].lat,
        longitude: locations[0].lng,
        location_name: locations[0].name,
        is_claimed: 1,
        is_first_hand: 1,
        source_info: null,
        scan_number: 1,
        created_at: hoursAgo(3),
      },
      {
        fingerprint_id: fingerprint, // Same device!
        ip_address: generateIP(),
        user_agent: randomElement(NORMAL_USER_AGENTS),
        latitude: locations[1].lat,
        longitude: locations[1].lng,
        location_name: locations[1].name,
        is_claimed: 0,
        is_first_hand: null,
        source_info: null,
        scan_number: 2,
        created_at: hoursAgo(1), // Only 2 hours later!
      },
    ],
  };
}

function generateHighVolumeSingleDeviceFraud(): FraudScanData {
  const fingerprint = generateFingerprint();
  const ip = generateIP();
  const location = randomElement(LEGITIMATE_LOCATIONS);
  const scans = [];

  // 50+ scans from same device in one day - suspicious!
  for (let i = 0; i < randomInt(30, 60); i++) {
    scans.push({
      fingerprint_id: fingerprint,
      ip_address: ip,
      user_agent: randomElement(NORMAL_USER_AGENTS),
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

  return {
    pattern: FRAUD_PATTERNS.HIGH_VOLUME_SINGLE_DEVICE,
    description: `${scans.length} scans from single device in 24 hours - potential scraping/testing`,
    scans,
  };
}

function generateVpnProxyFraud(): FraudScanData {
  const scans = [];

  // Multiple scans from VPN IPs with inconsistent locations
  for (let i = 0; i < randomInt(5, 10); i++) {
    const location = randomElement([
      ...LEGITIMATE_LOCATIONS,
      ...SUSPICIOUS_LOCATIONS,
    ]);
    scans.push({
      fingerprint_id: generateFingerprint(),
      ip_address: generateIP(true), // VPN IP
      user_agent: randomElement(NORMAL_USER_AGENTS),
      latitude: location.lat,
      longitude: location.lng,
      location_name: `${location.name} (VPN detected)`,
      is_claimed: i === 0 ? 1 : 0,
      is_first_hand: null,
      source_info: i === 0 ? 'Unknown marketplace' : null,
      scan_number: i + 1,
      created_at: hoursAgo(randomInt(1, 72)),
    });
  }

  return {
    pattern: FRAUD_PATTERNS.VPN_PROXY_USAGE,
    description:
      'Multiple scans from known VPN/proxy IP addresses - identity masking',
    scans,
  };
}

function generateMultipleClaimsFraud(): FraudScanData {
  // Multiple different devices trying to claim the same tag
  const scans = [];

  for (let i = 0; i < randomInt(3, 6); i++) {
    const location = randomElement(LEGITIMATE_LOCATIONS);
    scans.push({
      fingerprint_id: generateFingerprint(), // Different device each time
      ip_address: generateIP(),
      user_agent: randomElement(NORMAL_USER_AGENTS),
      latitude: location.lat + (Math.random() - 0.5) * 0.5,
      longitude: location.lng + (Math.random() - 0.5) * 0.5,
      location_name: location.name,
      is_claimed: 1, // All trying to claim!
      is_first_hand: Math.random() > 0.5 ? 1 : 0,
      source_info: randomElement([
        'Tokopedia',
        'Shopee',
        'Facebook Marketplace',
        'Teman',
        'Unknown',
      ]),
      scan_number: i + 1,
      created_at: daysAgo(randomInt(0, 7)),
    });
  }

  return {
    pattern: FRAUD_PATTERNS.MULTIPLE_CLAIMS,
    description: `${scans.length} different devices attempting to claim same tag - potential counterfeit`,
    scans,
  };
}

function generateLocationMismatchFraud(): FraudScanData {
  // Product distributed in Jakarta, scanned in Nigeria
  return {
    pattern: FRAUD_PATTERNS.LOCATION_MISMATCH,
    description:
      'Product distributed in Jakarta but scanned in Lagos, Nigeria - export fraud or counterfeit',
    scans: [
      {
        fingerprint_id: generateFingerprint(),
        ip_address: generateIP(),
        user_agent: randomElement(NORMAL_USER_AGENTS),
        latitude: SUSPICIOUS_LOCATIONS[0].lat, // Lagos
        longitude: SUSPICIOUS_LOCATIONS[0].lng,
        location_name: SUSPICIOUS_LOCATIONS[0].name,
        is_claimed: 1,
        is_first_hand: 0,
        source_info: 'Bought from local market',
        scan_number: 1,
        created_at: daysAgo(randomInt(1, 14)),
      },
    ],
  };
}

function generateBotLikeBehaviorFraud(): FraudScanData {
  const fingerprint = generateFingerprint();
  const scans = [];

  // Rapid fire scans - exactly 1 second apart (bot behavior)
  for (let i = 0; i < randomInt(10, 20); i++) {
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
      created_at: minutesAgo(i), // Exactly 1 minute apart
    });
  }

  return {
    pattern: FRAUD_PATTERNS.BOT_LIKE_BEHAVIOR,
    description: `${scans.length} automated scans with bot user-agent - scraping attempt`,
    scans,
  };
}

function generateSuspiciousOriginFraud(): FraudScanData {
  const location = randomElement(SUSPICIOUS_LOCATIONS.slice(1)); // Not Lagos

  return {
    pattern: FRAUD_PATTERNS.SUSPICIOUS_ORIGIN,
    description: `Scan from ${location.name} - outside normal distribution area`,
    scans: [
      {
        fingerprint_id: generateFingerprint(),
        ip_address: generateIP(),
        user_agent: randomElement(NORMAL_USER_AGENTS),
        latitude: location.lat,
        longitude: location.lng,
        location_name: location.name,
        is_claimed: 1,
        is_first_hand: 0,
        source_info: 'AliExpress',
        scan_number: 1,
        created_at: daysAgo(randomInt(1, 30)),
      },
      {
        fingerprint_id: generateFingerprint(),
        ip_address: generateIP(),
        user_agent: randomElement(NORMAL_USER_AGENTS),
        latitude: location.lat + 0.01,
        longitude: location.lng + 0.01,
        location_name: location.name,
        is_claimed: 0,
        is_first_hand: null,
        source_info: null,
        scan_number: 2,
        created_at: daysAgo(randomInt(0, 5)),
      },
    ],
  };
}

async function main() {
  console.log('🚨 Starting fraud scan data seeding...\n');

  // Get existing tags that are stamped and published
  const tags = await prisma.tag.findMany({
    where: {
      is_stamped: 1,
      publish_status: 1,
    },
    take: 50, // Limit to 50 tags for fraud data
    orderBy: {
      created_at: 'desc',
    },
  });

  if (tags.length === 0) {
    console.log('❌ No stamped tags found. Please run seed-data.ts first.\n');
    console.log('   Run: npx tsx scripts/seed-data.ts');
    return;
  }

  console.log(`Found ${tags.length} stamped tags to add fraud patterns\n`);

  const fraudGenerators = [
    generateImpossibleTravelFraud,
    generateHighVolumeSingleDeviceFraud,
    generateVpnProxyFraud,
    generateMultipleClaimsFraud,
    generateLocationMismatchFraud,
    generateBotLikeBehaviorFraud,
    generateSuspiciousOriginFraud,
  ];

  const fraudStats: Record<string, number> = {};
  let totalFraudScans = 0;

  // Assign fraud patterns to random subset of tags
  const fraudTagCount = Math.min(Math.ceil(tags.length * 0.3), 15); // 30% of tags or max 15

  for (let i = 0; i < fraudTagCount; i++) {
    const tag = tags[i];
    const fraudData = randomElement(fraudGenerators)();

    // Get current max scan number for this tag
    const maxScan = await prisma.tagScan.findFirst({
      where: { tag_id: tag.id },
      orderBy: { scan_number: 'desc' },
    });
    const startScanNumber = (maxScan?.scan_number ?? 0) + 1;

    // Create fraud scans
    for (let j = 0; j < fraudData.scans.length; j++) {
      const scan = fraudData.scans[j];
      await prisma.tagScan.create({
        data: {
          tag_id: tag.id,
          fingerprint_id: scan.fingerprint_id,
          ip_address: scan.ip_address,
          user_agent: scan.user_agent,
          latitude: scan.latitude,
          longitude: scan.longitude,
          location_name: scan.location_name,
          is_claimed: scan.is_claimed,
          is_first_hand: scan.is_first_hand,
          source_info: scan.source_info,
          scan_number: startScanNumber + j,
          created_at: scan.created_at,
        },
      });
      totalFraudScans++;
    }

    // Update tag to flagged status if it has suspicious activity
    if (fraudData.pattern !== FRAUD_PATTERNS.LOCATION_MISMATCH) {
      await prisma.tag.update({
        where: { id: tag.id },
        data: { chain_status: 4 }, // FLAGGED
      });
    }

    fraudStats[fraudData.pattern] = (fraudStats[fraudData.pattern] || 0) + 1;

    console.log(
      `🔴 Tag ${tag.code}: ${fraudData.pattern} - ${fraudData.description}`
    );
  }

  // Also add some legitimate scans for comparison
  console.log('\n✅ Adding legitimate scans for comparison...');

  let legitimateScans = 0;
  for (
    let i = fraudTagCount;
    i < Math.min(tags.length, fraudTagCount + 20);
    i++
  ) {
    const tag = tags[i];
    const location = randomElement(LEGITIMATE_LOCATIONS);
    const numScans = randomInt(1, 5);

    const maxScan = await prisma.tagScan.findFirst({
      where: { tag_id: tag.id },
      orderBy: { scan_number: 'desc' },
    });
    const startScanNumber = (maxScan?.scan_number ?? 0) + 1;

    for (let j = 0; j < numScans; j++) {
      await prisma.tagScan.create({
        data: {
          tag_id: tag.id,
          fingerprint_id: generateFingerprint(),
          ip_address: generateIP(),
          user_agent: randomElement(NORMAL_USER_AGENTS),
          latitude: location.lat + (Math.random() - 0.5) * 0.1,
          longitude: location.lng + (Math.random() - 0.5) * 0.1,
          location_name: location.name,
          is_claimed: j === 0 ? 1 : 0,
          is_first_hand: j === 0 ? 1 : null,
          source_info: null,
          scan_number: startScanNumber + j,
          created_at: daysAgo(randomInt(1, 60)),
        },
      });
      legitimateScans++;
    }
  }

  console.log(`   Added ${legitimateScans} legitimate scans\n`);

  console.log('═'.repeat(50));
  console.log('📊 Fraud Seeding Summary');
  console.log('═'.repeat(50));
  console.log(`\n🔴 Fraud Patterns Generated:`);
  for (const [pattern, count] of Object.entries(fraudStats)) {
    console.log(`   ${pattern}: ${count} tags`);
  }
  console.log(`\n📱 Total Fraud Scans: ${totalFraudScans}`);
  console.log(`✅ Total Legitimate Scans: ${legitimateScans}`);

  // Count flagged tags
  const flaggedCount = await prisma.tag.count({
    where: { chain_status: 4 },
  });
  console.log(`\n🚩 Total Flagged Tags: ${flaggedCount}`);

  console.log('\n✨ Fraud data seeding completed!');
  console.log('\nTip: Use the AI Agent to ask about fraud detection:');
  console.log('  - "Apakah ada aktivitas mencurigakan?"');
  console.log('  - "Berapa tag yang di-flag karena fraud?"');
  console.log('  - "Tunjukkan pola fraud yang terdeteksi"');
}

main()
  .catch((e) => {
    console.error('❌ Fraud seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
