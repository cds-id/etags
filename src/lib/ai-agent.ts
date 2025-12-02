/**
 * AI Agent Service
 * Provides intelligent chat assistance with role-based data access
 */

import { prisma } from './db';
import { chatCompletion, type ChatMessage } from './kolosal-ai';
import type { AgentContext, FraudAnalytics } from '@/types/ai-agent';

interface ProductMetadata {
  name?: string;
  [key: string]: unknown;
}

/**
 * Get fraud analytics data
 */
async function getFraudAnalytics(
  isAdmin: boolean,
  productIds?: number[]
): Promise<FraudAnalytics> {
  // Build tag filter based on role
  let tagFilter = {};
  if (!isAdmin && productIds) {
    // For brand users, we need to filter by their product IDs
    const allTags = await prisma.tag.findMany({
      select: { id: true, product_ids: true },
    });
    const brandTagIds = allTags
      .filter((tag) => {
        const tagProductIds = Array.isArray(tag.product_ids)
          ? (tag.product_ids as number[])
          : [];
        return tagProductIds.some((id) => productIds.includes(id));
      })
      .map((t) => t.id);
    tagFilter = { tag_id: { in: brandTagIds } };
  }

  // Get total scans and unique devices
  const [totalScans, scansWithFingerprints] = await Promise.all([
    prisma.tagScan.count({ where: tagFilter }),
    prisma.tagScan.findMany({
      where: tagFilter,
      select: { fingerprint_id: true },
      distinct: ['fingerprint_id'],
    }),
  ]);

  const uniqueDevices = scansWithFingerprints.length;

  // Get flagged and claimed tags count
  const [flaggedTags, claimedScans] = await Promise.all([
    isAdmin
      ? prisma.tag.count({ where: { chain_status: 4 } })
      : prisma.tag.count({
          where: {
            chain_status: 4,
            id: {
              in: (tagFilter as { tag_id?: { in: number[] } }).tag_id?.in || [],
            },
          },
        }),
    prisma.tagScan.count({ where: { ...tagFilter, is_claimed: 1 } }),
  ]);

  // Analyze suspicious patterns
  const suspiciousPatterns = {
    impossibleTravel: 0,
    highVolumeDevice: 0,
    vpnUsage: 0,
    multipleClaims: 0,
    locationMismatch: 0,
  };

  // 1. High volume single device (more than 20 scans from same fingerprint)
  const highVolumeDevices = await prisma.tagScan.groupBy({
    by: ['fingerprint_id'],
    where: tagFilter,
    _count: true,
    having: {
      fingerprint_id: {
        _count: {
          gt: 20,
        },
      },
    },
  });
  suspiciousPatterns.highVolumeDevice = highVolumeDevices.length;

  // 2. Multiple claims on same tag (more than 1 claim)
  const multipleClaimTags = await prisma.tagScan.groupBy({
    by: ['tag_id'],
    where: { ...tagFilter, is_claimed: 1 },
    _count: true,
    having: {
      tag_id: {
        _count: {
          gt: 1,
        },
      },
    },
  });
  suspiciousPatterns.multipleClaims = multipleClaimTags.length;

  // 3. VPN/Proxy usage (check for known VPN IP prefixes in location names)
  const vpnScans = await prisma.tagScan.count({
    where: {
      ...tagFilter,
      location_name: {
        contains: 'VPN',
      },
    },
  });
  suspiciousPatterns.vpnUsage = vpnScans > 0 ? 1 : 0;

  // 4. Location mismatch (scans from outside Indonesia - check for non-ID locations)
  const suspiciousLocations = [
    'Nigeria',
    'Russia',
    'China',
    'Unknown',
    'Moscow',
    'Lagos',
    'Shenzen',
  ];
  let locationMismatchCount = 0;
  for (const loc of suspiciousLocations) {
    const count = await prisma.tagScan.count({
      where: {
        ...tagFilter,
        location_name: {
          contains: loc,
        },
      },
    });
    if (count > 0) locationMismatchCount++;
  }
  suspiciousPatterns.locationMismatch = locationMismatchCount;

  // 5. Impossible travel (same fingerprint, different distant locations within hours)
  // Simplified: check for same device scanning from very different coordinates
  const deviceScans = await prisma.tagScan.findMany({
    where: {
      ...tagFilter,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      fingerprint_id: true,
      latitude: true,
      longitude: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
    take: 1000,
  });

  // Group by fingerprint and check for large distance jumps
  const deviceLocationMap = new Map<
    string,
    Array<{ lat: number; lng: number; time: Date }>
  >();
  for (const scan of deviceScans) {
    if (scan.latitude && scan.longitude) {
      const existing = deviceLocationMap.get(scan.fingerprint_id) || [];
      existing.push({
        lat: scan.latitude,
        lng: scan.longitude,
        time: scan.created_at,
      });
      deviceLocationMap.set(scan.fingerprint_id, existing);
    }
  }

  // Check for impossible travel (>1000km in <6 hours)
  for (const [, locations] of deviceLocationMap) {
    if (locations.length >= 2) {
      for (let i = 0; i < locations.length - 1; i++) {
        const loc1 = locations[i];
        const loc2 = locations[i + 1];
        const distance = calculateDistance(
          loc1.lat,
          loc1.lng,
          loc2.lat,
          loc2.lng
        );
        const timeDiff =
          Math.abs(loc1.time.getTime() - loc2.time.getTime()) /
          (1000 * 60 * 60); // hours
        if (distance > 1000 && timeDiff < 6) {
          suspiciousPatterns.impossibleTravel++;
          break;
        }
      }
    }
  }

  // Get top scan locations
  const locationGroups = await prisma.tagScan.groupBy({
    by: ['location_name'],
    where: {
      ...tagFilter,
      location_name: { not: null },
    },
    _count: true,
    orderBy: {
      _count: {
        location_name: 'desc',
      },
    },
    take: 5,
  });

  const topScanLocations = locationGroups
    .filter((g) => g.location_name)
    .map((g) => ({
      location: g.location_name!,
      count: g._count,
    }));

  // Get recent suspicious scans (from flagged tags or suspicious locations)
  const flaggedTagIds = await prisma.tag.findMany({
    where: isAdmin
      ? { chain_status: 4 }
      : {
          chain_status: 4,
          id: {
            in: (tagFilter as { tag_id?: { in: number[] } }).tag_id?.in || [],
          },
        },
    select: { id: true, code: true },
  });

  const recentSuspiciousScans: FraudAnalytics['recentSuspiciousScans'] = [];

  for (const tag of flaggedTagIds.slice(0, 5)) {
    const latestScan = await prisma.tagScan.findFirst({
      where: { tag_id: tag.id },
      orderBy: { created_at: 'desc' },
    });

    if (latestScan) {
      let reason = 'Tag flagged for review';
      if (
        latestScan.location_name?.includes('VPN') ||
        latestScan.location_name?.includes('Unknown')
      ) {
        reason = 'VPN/Proxy detected';
      } else if (
        suspiciousLocations.some((loc) =>
          latestScan.location_name?.includes(loc)
        )
      ) {
        reason = 'Suspicious location';
      }

      recentSuspiciousScans.push({
        tagCode: tag.code,
        location: latestScan.location_name,
        reason,
        timestamp: latestScan.created_at,
      });
    }
  }

  return {
    totalScans,
    uniqueDevices,
    flaggedTags,
    claimedTags: claimedScans,
    suspiciousPatterns,
    topScanLocations,
    recentSuspiciousScans,
  };
}

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get AI agent context with role-based data filtering
 */
export async function getAIAgentContext(
  userId: number,
  role: 'admin' | 'brand',
  brandId?: number
): Promise<AgentContext> {
  const isAdmin = role === 'admin';

  // Get dashboard statistics
  let stats = {
    brands: 0,
    products: 0,
    tags: 0,
    stampedTags: 0,
  };

  let brandName: string | undefined;

  if (isAdmin) {
    // Admin sees all data
    const [brandsCount, productsCount, tagsCount, stampedTagsCount] =
      await Promise.all([
        prisma.brand.count(),
        prisma.product.count(),
        prisma.tag.count(),
        prisma.tag.count({ where: { is_stamped: 1 } }),
      ]);

    stats = {
      brands: brandsCount,
      products: productsCount,
      tags: tagsCount,
      stampedTags: stampedTagsCount,
    };
  } else if (brandId) {
    // Brand user sees only their data
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { name: true },
    });

    brandName = brand?.name;

    // Get product IDs for this brand
    const brandProducts = await prisma.product.findMany({
      where: { brand_id: brandId },
      select: { id: true },
    });
    const productIds = brandProducts.map((p) => p.id);

    // Count tags that contain any of the brand's products
    const allTags = await prisma.tag.findMany({
      select: { id: true, product_ids: true, is_stamped: true },
    });

    let tagsCount = 0;
    let stampedTagsCount = 0;

    for (const tag of allTags) {
      const tagProductIds = Array.isArray(tag.product_ids)
        ? (tag.product_ids as number[])
        : [];
      const belongsToBrand = tagProductIds.some((id) =>
        productIds.includes(id)
      );
      if (belongsToBrand) {
        tagsCount++;
        if (tag.is_stamped === 1) {
          stampedTagsCount++;
        }
      }
    }

    stats = {
      brands: 1,
      products: productIds.length,
      tags: tagsCount,
      stampedTags: stampedTagsCount,
    };
  }

  // Get recent activity
  let recentActivity;

  if (isAdmin) {
    // Admin: get recent products and tags from all brands
    const [recentProducts, recentTags] = await Promise.all([
      prisma.product.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          metadata: true,
          status: true,
        },
      }),
      prisma.tag.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          publish_status: true,
          is_stamped: true,
        },
      }),
    ]);

    recentActivity = {
      products: recentProducts.map((p) => ({
        id: p.id,
        code: p.code,
        name:
          (p.metadata as unknown as ProductMetadata)?.name || 'Unnamed Product',
        status: p.status,
      })),
      tags: recentTags.map((t) => ({
        id: t.id,
        code: t.code,
        publishStatus: t.publish_status,
        isStamped: t.is_stamped,
      })),
    };
  } else if (brandId) {
    // Brand user: get only their products
    const [recentProducts, allTags] = await Promise.all([
      prisma.product.findMany({
        where: { brand_id: brandId },
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          metadata: true,
          status: true,
        },
      }),
      prisma.tag.findMany({
        take: 20,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          code: true,
          product_ids: true,
          publish_status: true,
          is_stamped: true,
        },
      }),
    ]);

    // Get product IDs for filtering tags
    const productIds = await prisma.product
      .findMany({
        where: { brand_id: brandId },
        select: { id: true },
      })
      .then((products) => products.map((p) => p.id));

    // Filter tags that belong to this brand
    const brandTags = allTags
      .filter((tag) => {
        const tagProductIds = Array.isArray(tag.product_ids)
          ? (tag.product_ids as number[])
          : [];
        return tagProductIds.some((id) => productIds.includes(id));
      })
      .slice(0, 5);

    recentActivity = {
      products: recentProducts.map((p) => ({
        id: p.id,
        code: p.code,
        name:
          (p.metadata as unknown as ProductMetadata)?.name || 'Unnamed Product',
        status: p.status,
      })),
      tags: brandTags.map((t) => ({
        id: t.id,
        code: t.code,
        publishStatus: t.publish_status,
        isStamped: t.is_stamped,
      })),
    };
  }

  // Get fraud analytics
  let productIdsForFraud: number[] | undefined;
  if (!isAdmin && brandId) {
    const brandProducts = await prisma.product.findMany({
      where: { brand_id: brandId },
      select: { id: true },
    });
    productIdsForFraud = brandProducts.map((p) => p.id);
  }

  const fraudAnalytics = await getFraudAnalytics(isAdmin, productIdsForFraud);

  return {
    userId,
    role,
    brandId,
    brandName,
    stats,
    recentActivity,
    fraudAnalytics,
  };
}

/**
 * Format agent context for AI consumption
 */
function formatContextForAI(context: AgentContext): string {
  const lines: string[] = [];

  lines.push('=== USER CONTEXT ===');
  lines.push(
    `Role: ${context.role === 'admin' ? 'Administrator' : 'Brand User'}`
  );
  if (context.brandName) {
    lines.push(`Brand: ${context.brandName}`);
  }

  lines.push('\n=== DASHBOARD STATISTICS ===');
  lines.push(`Total Brands: ${context.stats.brands}`);
  lines.push(`Total Products: ${context.stats.products}`);
  lines.push(`Total Tags: ${context.stats.tags}`);
  lines.push(`Stamped Tags (on blockchain): ${context.stats.stampedTags}`);

  if (context.recentActivity) {
    lines.push('\n=== RECENT PRODUCTS ===');
    context.recentActivity.products.forEach((p, i) => {
      lines.push(
        `${i + 1}. ${p.name} (Code: ${p.code}, Status: ${p.status === 1 ? 'Active' : 'Inactive'})`
      );
    });

    lines.push('\n=== RECENT TAGS ===');
    context.recentActivity.tags.forEach((t, i) => {
      const status =
        t.isStamped === 1
          ? 'Stamped'
          : t.publishStatus === 1
            ? 'Published'
            : 'Draft';
      lines.push(`${i + 1}. ${t.code} (Status: ${status})`);
    });
  }

  // Add fraud analytics
  if (context.fraudAnalytics) {
    const fa = context.fraudAnalytics;
    lines.push('\n=== SCAN ANALYTICS ===');
    lines.push(`Total Scans: ${fa.totalScans}`);
    lines.push(`Unique Devices: ${fa.uniqueDevices}`);
    lines.push(`Claimed Tags: ${fa.claimedTags}`);

    lines.push('\n=== FRAUD DETECTION ===');
    lines.push(`Flagged Tags: ${fa.flaggedTags}`);
    lines.push('Suspicious Patterns Detected:');
    lines.push(
      `  - Impossible Travel: ${fa.suspiciousPatterns.impossibleTravel} incidents`
    );
    lines.push(
      `  - High Volume Single Device: ${fa.suspiciousPatterns.highVolumeDevice} devices`
    );
    lines.push(
      `  - VPN/Proxy Usage: ${fa.suspiciousPatterns.vpnUsage > 0 ? 'Detected' : 'None'}`
    );
    lines.push(
      `  - Multiple Claims on Same Tag: ${fa.suspiciousPatterns.multipleClaims} tags`
    );
    lines.push(
      `  - Location Mismatch (Outside Indonesia): ${fa.suspiciousPatterns.locationMismatch > 0 ? 'Detected' : 'None'}`
    );

    if (fa.topScanLocations.length > 0) {
      lines.push('\nTop Scan Locations:');
      fa.topScanLocations.forEach((loc, i) => {
        lines.push(`  ${i + 1}. ${loc.location}: ${loc.count} scans`);
      });
    }

    if (fa.recentSuspiciousScans.length > 0) {
      lines.push('\nRecent Suspicious Activity:');
      fa.recentSuspiciousScans.forEach((scan, i) => {
        const date = new Date(scan.timestamp).toLocaleDateString('id-ID');
        lines.push(
          `  ${i + 1}. Tag ${scan.tagCode} - ${scan.reason} (${scan.location || 'Unknown location'}, ${date})`
        );
      });
    }
  }

  return lines.join('\n');
}

/**
 * Get system prompt based on user role
 */
function getSystemPrompt(role: 'admin' | 'brand', brandName?: string): string {
  const commonRules = `
IMPORTANT RULES:
- NEVER ask questions or request more information from the user
- NEVER include follow-up queries like "Apakah Anda ingin..." or "Mau saya jelaskan lebih lanjut?"
- Work ONLY with the data provided in the context
- Provide definitive answers and actionable recommendations
- If data is insufficient, state what you observed and provide general guidance
- Keep responses concise and to the point
- Use Indonesian language primarily with English for technical terms`;

  if (role === 'admin') {
    return `You are an AI assistant for an administrator of the eTag product authentication system.

You have access to ALL system data across all brands, including:
- All brands registered in the system
- All products from all brands
- All authentication tags
- Blockchain stamping statistics
- Tag scan analytics and location data
- Fraud detection and suspicious activity reports

Your role is to:
1. Provide comprehensive insights about the entire platform
2. Help with administrative tasks and decision-making
3. Analyze trends across multiple brands
4. Monitor and report suspicious activities and potential fraud
5. Suggest improvements and optimizations
6. Answer questions about any brand or product in the system

FRAUD DETECTION CAPABILITIES:
- Impossible Travel: Same device scanning from distant locations in short time
- High Volume Device: Single device making excessive scans (potential bot/scraper)
- VPN/Proxy Usage: Scans from masked IP addresses
- Multiple Claims: Different devices claiming the same tag (potential counterfeit)
- Location Mismatch: Scans from unexpected countries (outside distribution area)

When discussing fraud, provide specific details and actionable recommendations. Be professional and data-driven.
${commonRules}`;
  }

  return `You are an AI assistant for a brand user${brandName ? ` of ${brandName}` : ''} in the eTag product authentication system.

You have access to ONLY this brand's data, including:
- Their products
- Their authentication tags
- Blockchain stamping statistics for their tags
- Scan analytics and location data for their tags
- Fraud detection reports for their products

Your role is to:
1. Help manage their products and tags
2. Provide insights about their brand's performance
3. Explain blockchain authentication features
4. Monitor suspicious activities on their products
5. Suggest ways to improve product authenticity and security
6. Answer questions about tag scans and consumer engagement

FRAUD ALERTS FOR YOUR BRAND:
- You can see if any tags have been flagged for suspicious activity
- Monitor for unusual scan patterns that might indicate counterfeiting
- Track geographic distribution of scans

DATA ACCESS: You can ONLY see and discuss data for this specific brand. If asked about other brands or system-wide data, explain that you only have access to this brand's information.
${commonRules}`;
}

/**
 * Chat with AI agent
 */
export async function chatWithAgent(
  messages: ChatMessage[],
  userId: number,
  role: 'admin' | 'brand',
  brandId?: number
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  try {
    // Get user context
    const context = await getAIAgentContext(userId, role, brandId);

    // Build context string
    const contextString = formatContextForAI(context);

    // Prepare messages with system prompt and context
    const systemPrompt = getSystemPrompt(role, context.brandName);

    const aiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: contextString },
      ...messages,
    ];

    // Get AI response
    const response = await chatCompletion(aiMessages, {
      model: 'Claude Sonnet 4.5',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = response.choices[0]?.message?.content;

    if (!aiMessage) {
      return {
        success: false,
        error: 'No response from AI',
      };
    }

    return {
      success: true,
      message: aiMessage,
      usage: response.usage,
    };
  } catch (error) {
    console.error('AI Agent error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get AI response',
    };
  }
}
