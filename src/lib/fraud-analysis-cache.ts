/**
 * Fraud Analysis Cache
 * Caches AI fraud analysis results with 5-minute TTL to reduce API calls
 * and handle cases where location data may be inaccurate
 */

import { prisma } from './db';
import {
  analyzeFraud,
  quickFraudCheck,
  type DistributionInfo,
  type ScanLocation,
  type FraudAnalysisResult,
} from './fraud-detection';

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// In-memory cache for fraud analysis results
// Key: tagCode, Value: { result, timestamp, scanLocation }
const fraudAnalysisCache = new Map<
  string,
  {
    result: FraudAnalysisResult;
    timestamp: number;
    scanLocationHash: string;
  }
>();

/**
 * Generate a hash for scan location to detect significant location changes
 */
function hashScanLocation(location: ScanLocation): string {
  // Round coordinates to ~1km precision to avoid cache misses for minor GPS drift
  const latRounded = location.latitude
    ? Math.round(location.latitude * 100) / 100
    : 'unknown';
  const lonRounded = location.longitude
    ? Math.round(location.longitude * 100) / 100
    : 'unknown';
  const locationName = location.locationName?.toLowerCase().trim() || 'unknown';

  return `${latRounded}:${lonRounded}:${locationName}`;
}

/**
 * Check if cached result is still valid
 */
function isCacheValid(
  cached: {
    result: FraudAnalysisResult;
    timestamp: number;
    scanLocationHash: string;
  },
  currentLocationHash: string
): boolean {
  const now = Date.now();
  const isNotExpired = now - cached.timestamp < CACHE_TTL_MS;
  const isSameLocation = cached.scanLocationHash === currentLocationHash;

  // Cache is valid if not expired AND location hasn't changed significantly
  return isNotExpired && isSameLocation;
}

/**
 * Get cached fraud analysis or perform new analysis
 */
export async function getCachedFraudAnalysis(
  tagCode: string,
  distribution: DistributionInfo,
  scanLocation: ScanLocation,
  scanHistory: {
    totalScans: number;
    uniqueScanners: number;
    recentLocations: string[];
  }
): Promise<
  FraudAnalysisResult & { fromCache: boolean; cacheExpiresAt?: string }
> {
  const locationHash = hashScanLocation(scanLocation);
  const cached = fraudAnalysisCache.get(tagCode);

  // Check if we have a valid cached result
  if (cached && isCacheValid(cached, locationHash)) {
    const expiresAt = new Date(cached.timestamp + CACHE_TTL_MS).toISOString();
    return {
      ...cached.result,
      fromCache: true,
      cacheExpiresAt: expiresAt,
    };
  }

  // Perform new AI analysis
  try {
    const result = await analyzeFraud(distribution, scanLocation, scanHistory);

    // Store in cache
    fraudAnalysisCache.set(tagCode, {
      result,
      timestamp: Date.now(),
      scanLocationHash: locationHash,
    });

    const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    return {
      ...result,
      fromCache: false,
      cacheExpiresAt: expiresAt,
    };
  } catch (error) {
    console.error('AI fraud analysis failed, using quick check:', error);

    // Fallback to rule-based quick check
    const quickResult = quickFraudCheck(distribution, scanLocation);

    const fallbackResult: FraudAnalysisResult = {
      isSuspicious: quickResult.isSuspicious,
      riskLevel: quickResult.isSuspicious ? 'medium' : 'low',
      riskScore: quickResult.isSuspicious ? 40 : 0,
      reasons: quickResult.reason ? [quickResult.reason] : [],
      recommendation: quickResult.isSuspicious
        ? 'Lokasi pemindaian tidak sesuai dengan wilayah distribusi. Periksa keaslian produk.'
        : 'Tidak ada masalah terdeteksi.',
      details: {
        locationMatch: !quickResult.isSuspicious,
        channelMatch: true,
        marketMatch: !quickResult.isSuspicious,
      },
    };

    // Cache the fallback result too
    fraudAnalysisCache.set(tagCode, {
      result: fallbackResult,
      timestamp: Date.now(),
      scanLocationHash: locationHash,
    });

    const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    return {
      ...fallbackResult,
      fromCache: false,
      cacheExpiresAt: expiresAt,
    };
  }
}

/**
 * Invalidate cache for a specific tag
 */
export function invalidateFraudCache(tagCode: string): void {
  fraudAnalysisCache.delete(tagCode);
}

/**
 * Clear all cached fraud analysis results
 */
export function clearFraudCache(): void {
  fraudAnalysisCache.clear();
}

/**
 * Get cache statistics
 */
export function getFraudCacheStats(): {
  size: number;
  entries: Array<{ tagCode: string; expiresAt: string; isExpired: boolean }>;
} {
  const now = Date.now();
  const entries: Array<{
    tagCode: string;
    expiresAt: string;
    isExpired: boolean;
  }> = [];

  fraudAnalysisCache.forEach((value, key) => {
    const expiresAt = new Date(value.timestamp + CACHE_TTL_MS);
    entries.push({
      tagCode: key,
      expiresAt: expiresAt.toISOString(),
      isExpired: now > value.timestamp + CACHE_TTL_MS,
    });
  });

  return {
    size: fraudAnalysisCache.size,
    entries,
  };
}

/**
 * Clean up expired cache entries (call periodically)
 */
export function cleanupExpiredCache(): number {
  const now = Date.now();
  let cleaned = 0;

  fraudAnalysisCache.forEach((value, key) => {
    if (now - value.timestamp >= CACHE_TTL_MS) {
      fraudAnalysisCache.delete(key);
      cleaned++;
    }
  });

  return cleaned;
}

/**
 * Enhanced fraud analysis that combines AI analysis with database scan patterns
 */
export async function getEnhancedFraudAnalysis(
  tagCode: string,
  distribution: DistributionInfo,
  currentScanLocation: ScanLocation
): Promise<
  FraudAnalysisResult & { fromCache: boolean; cacheExpiresAt?: string }
> {
  // Get scan history from database
  const tag = await prisma.tag.findUnique({
    where: { code: tagCode },
    include: {
      scans: {
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  });

  if (!tag) {
    return {
      isSuspicious: true,
      riskLevel: 'critical',
      riskScore: 100,
      reasons: ['Tag tidak ditemukan dalam sistem'],
      recommendation: 'Tag tidak valid. Jangan percaya keaslian produk ini.',
      details: {
        locationMatch: false,
        channelMatch: false,
        marketMatch: false,
      },
      fromCache: false,
    };
  }

  // Build scan history
  const uniqueScanners = new Set(tag.scans.map((s) => s.fingerprint_id)).size;
  const recentLocations = tag.scans
    .filter((s) => s.location_name)
    .map((s) => s.location_name as string)
    .slice(0, 5);

  const scanHistory = {
    totalScans: tag.scans.length,
    uniqueScanners,
    recentLocations,
  };

  // Get cached or fresh AI analysis
  return getCachedFraudAnalysis(
    tagCode,
    distribution,
    currentScanLocation,
    scanHistory
  );
}
