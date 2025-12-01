import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ProductMetadata, TagMetadata } from '@/lib/product-templates';
import { validateTagOnChain } from '@/lib/tag-sync';
import { CHAIN_STATUS, getChainStatusLabel } from '@/lib/constants';
import { fetchTagMetadata } from '@/lib/tag-stamping';
import { getCachedFraudAnalysis } from '@/lib/fraud-analysis-cache';
import type { DistributionInfo, ScanLocation } from '@/lib/fraud-detection';

export type VerifyResponse = {
  success: boolean;
  error?: string;
  tag?: {
    code: string;
    isStamped: boolean;
    chainStatus: number | null;
    chainStatusLabel: string;
    isRevoked: boolean;
    createdAt: string;
    products: Array<{
      code: string;
      name: string;
      description?: string;
      brand: string;
      brandLogo?: string;
      images?: string[];
    }>;
    distribution?: {
      region?: string;
      country?: string;
      channel?: string;
      intendedMarket?: string;
    };
  };
  blockchainValidation?: {
    isValidOnChain: boolean;
    chainStatus: number | null;
    chainStatusLabel: string;
    metadataUri?: string;
    createdAt?: string;
    transactionHash?: string;
  };
  blockchainMetadata?: {
    stampedAt: string;
    transactionHash: string | null;
    network: string;
    chainId: number;
    contractAddress: string;
    metadataUrl: string;
    qrCodeUrl: string;
    verifyUrl: string;
  };
  scanStats: {
    totalScans: number;
    uniqueScanners: number;
    firstScanAt?: string;
    lastScanAt?: string;
    scanLocations: string[];
  };
  scanHistory: Array<{
    scanNumber: number;
    createdAt: string;
    locationName?: string;
    isFirstHand: boolean | null;
    sourceInfo?: string;
  }>;
  fraudAnalysis: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    flags: Array<{
      type: string;
      severity: 'info' | 'warning' | 'danger';
      message: string;
    }>;
    locationMismatch: boolean;
    suspiciousScanPattern: boolean;
    multipleLocationsInShortTime: boolean;
  };
  aiAnalysis?: {
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    reasons: string[];
    recommendation: string;
    details: {
      locationMatch: boolean;
      channelMatch: boolean;
      marketMatch: boolean;
    };
    fromCache: boolean;
    cacheExpiresAt?: string;
  };
};

/**
 * GET /api/verify?code=TAG-XXXXX&lat=...&lon=...&location=...
 *
 * Public endpoint to verify a tag
 * Optional: lat, lon, location params for AI fraud analysis
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tagCode = searchParams.get('code');

  // Optional location parameters for AI fraud analysis
  const latitude = searchParams.get('lat')
    ? parseFloat(searchParams.get('lat')!)
    : undefined;
  const longitude = searchParams.get('lon')
    ? parseFloat(searchParams.get('lon')!)
    : undefined;
  const locationName = searchParams.get('location') || undefined;

  if (!tagCode) {
    return NextResponse.json<VerifyResponse>(
      {
        success: false,
        error: 'Tag code is required',
        scanStats: { totalScans: 0, uniqueScanners: 0, scanLocations: [] },
        scanHistory: [],
        fraudAnalysis: {
          overallRisk: 'low',
          riskScore: 0,
          flags: [],
          locationMismatch: false,
          suspiciousScanPattern: false,
          multipleLocationsInShortTime: false,
        },
      },
      { status: 400 }
    );
  }

  try {
    // Find the tag
    const tag = await prisma.tag.findUnique({
      where: { code: tagCode },
      include: {
        scans: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!tag) {
      return NextResponse.json<VerifyResponse>(
        {
          success: false,
          error: 'Tag tidak ditemukan',
          scanStats: { totalScans: 0, uniqueScanners: 0, scanLocations: [] },
          scanHistory: [],
          fraudAnalysis: {
            overallRisk: 'critical',
            riskScore: 100,
            flags: [
              {
                type: 'not_found',
                severity: 'danger',
                message: 'Tag tidak terdaftar dalam sistem',
              },
            ],
            locationMismatch: false,
            suspiciousScanPattern: false,
            multipleLocationsInShortTime: false,
          },
        },
        { status: 404 }
      );
    }

    // Check blockchain status
    const isStampedInDb = tag.is_stamped === 1;
    let blockchainValidation: VerifyResponse['blockchainValidation'] =
      undefined;
    let isRevoked = false;
    let chainStatus = tag.chain_status;

    if (isStampedInDb) {
      const chainValidation = await validateTagOnChain(tag.code);

      if (chainValidation) {
        chainStatus = chainValidation.status ?? null;
        isRevoked = chainStatus === CHAIN_STATUS.REVOKED;

        blockchainValidation = {
          isValidOnChain: chainValidation.isValid,
          chainStatus: chainStatus,
          chainStatusLabel: getChainStatusLabel(chainStatus),
          metadataUri: chainValidation.metadataUri,
          createdAt: chainValidation.createdAt?.toISOString(),
        };

        // Sync chain status to database if different
        if (chainStatus !== null && chainStatus !== tag.chain_status) {
          await prisma.tag.update({
            where: { id: tag.id },
            data: { chain_status: chainStatus },
          });
        }
      }
    }

    // Get tag metadata for distribution info
    const tagMetadata = tag.metadata as TagMetadata;
    const distributionInfo = {
      region: tagMetadata.distribution_region,
      country: tagMetadata.distribution_country,
      channel: tagMetadata.distribution_channel,
      intendedMarket: tagMetadata.intended_market,
    };

    // Get product information
    const productIds = tag.product_ids as number[];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { brand: true },
    });

    const productInfo = products.map((p) => {
      const metadata = p.metadata as ProductMetadata;
      return {
        code: p.code,
        name: metadata.name || p.code,
        description: metadata.description,
        brand: p.brand.name,
        brandLogo: p.brand.logo_url || undefined,
        images: metadata.images || [],
      };
    });

    // Calculate scan statistics
    const totalScans = tag.scans.length;
    const uniqueFingerprints = new Set(tag.scans.map((s) => s.fingerprint_id));
    const uniqueScanners = uniqueFingerprints.size;
    const scanLocations = [
      ...new Set(
        tag.scans
          .filter((s) => s.location_name)
          .map((s) => s.location_name as string)
      ),
    ];

    const firstScan = tag.scans[tag.scans.length - 1];
    const lastScan = tag.scans[0];

    // Build scan history
    const scanHistory = tag.scans.map((s) => ({
      scanNumber: s.scan_number,
      createdAt: s.created_at.toISOString(),
      locationName: s.location_name || undefined,
      isFirstHand:
        s.is_first_hand === 1 ? true : s.is_first_hand === 0 ? false : null,
      sourceInfo: s.source_info || undefined,
    }));

    // Fraud analysis
    const fraudFlags: VerifyResponse['fraudAnalysis']['flags'] = [];
    let riskScore = 0;

    // Check if tag is revoked
    if (isRevoked) {
      fraudFlags.push({
        type: 'revoked',
        severity: 'danger',
        message: 'Tag telah dicabut (revoked) dari blockchain',
      });
      riskScore += 50;
    }

    // Check if not stamped
    if (!isStampedInDb) {
      fraudFlags.push({
        type: 'not_stamped',
        severity: 'danger',
        message: 'Tag belum terverifikasi di blockchain',
      });
      riskScore += 40;
    }

    // Check location mismatch
    let locationMismatch = false;
    if (distributionInfo.country && scanLocations.length > 0) {
      const distributionCountry = distributionInfo.country.toLowerCase();
      const hasLocationOutsideDistribution = scanLocations.some(
        (loc) => !loc.toLowerCase().includes(distributionCountry)
      );
      if (hasLocationOutsideDistribution) {
        locationMismatch = true;
        fraudFlags.push({
          type: 'location_mismatch',
          severity: 'warning',
          message: `Tag dipindai di luar wilayah distribusi resmi (${distributionInfo.country})`,
        });
        riskScore += 20;
      }
    }

    // Check suspicious scan pattern (too many unique scanners)
    let suspiciousScanPattern = false;
    if (uniqueScanners > 10) {
      suspiciousScanPattern = true;
      fraudFlags.push({
        type: 'many_scanners',
        severity: 'warning',
        message: `Tag telah dipindai oleh ${uniqueScanners} perangkat berbeda`,
      });
      riskScore += 15;
    }

    // Check multiple locations in short time
    let multipleLocationsInShortTime = false;
    if (tag.scans.length >= 2) {
      const recentScans = tag.scans.slice(0, 5);
      const uniqueRecentLocations = new Set(
        recentScans.filter((s) => s.location_name).map((s) => s.location_name)
      );
      if (uniqueRecentLocations.size >= 3) {
        // Check if within 24 hours
        const first = recentScans[recentScans.length - 1];
        const last = recentScans[0];
        const hoursDiff =
          (last.created_at.getTime() - first.created_at.getTime()) /
          (1000 * 60 * 60);
        if (hoursDiff < 24) {
          multipleLocationsInShortTime = true;
          fraudFlags.push({
            type: 'rapid_location_change',
            severity: 'danger',
            message:
              'Tag dipindai di banyak lokasi berbeda dalam waktu singkat',
          });
          riskScore += 25;
        }
      }
    }

    // Determine overall risk level
    let overallRisk: VerifyResponse['fraudAnalysis']['overallRisk'] = 'low';
    if (riskScore >= 70) overallRisk = 'critical';
    else if (riskScore >= 40) overallRisk = 'high';
    else if (riskScore >= 20) overallRisk = 'medium';

    // Add positive flags
    if (isStampedInDb && !isRevoked && fraudFlags.length === 0) {
      fraudFlags.push({
        type: 'verified',
        severity: 'info',
        message: 'Tag terverifikasi dan valid di blockchain',
      });
    }

    // Fetch blockchain metadata if tag is stamped
    let blockchainMetadata: VerifyResponse['blockchainMetadata'] = undefined;

    if (isStampedInDb && !isRevoked) {
      const metadataResult = await fetchTagMetadata(tag.code);
      if (metadataResult.success && metadataResult.metadata) {
        const meta = metadataResult.metadata;
        blockchainMetadata = {
          stampedAt: meta.tag.stamped_at,
          transactionHash: meta.verification.blockchain.transaction_hash,
          network: meta.verification.blockchain.network,
          chainId: meta.verification.blockchain.chain_id,
          contractAddress: meta.verification.blockchain.contract_address,
          metadataUrl: meta.verification.qr_code_url.replace(
            '/qr-code.png',
            '/metadata.json'
          ),
          qrCodeUrl: meta.verification.qr_code_url,
          verifyUrl: meta.verification.verify_url,
        };

        // Add transaction hash to blockchain validation
        if (blockchainValidation) {
          blockchainValidation.transactionHash =
            meta.verification.blockchain.transaction_hash || undefined;
        }
      }
    }

    // AI-powered fraud analysis with caching (5-minute TTL)
    let aiAnalysis: VerifyResponse['aiAnalysis'] = undefined;

    // Build current scan location from query params or latest scan
    const currentScanLocation: ScanLocation = {
      latitude,
      longitude,
      locationName: locationName || lastScan?.location_name || undefined,
    };

    // Build distribution info for AI analysis
    const distributionForAI: DistributionInfo = {
      region: distributionInfo.region,
      country: distributionInfo.country,
      channel: distributionInfo.channel,
      intended_market: distributionInfo.intendedMarket,
    };

    // Only run AI analysis if we have location data or distribution info
    const hasLocationData =
      currentScanLocation.latitude ||
      currentScanLocation.longitude ||
      currentScanLocation.locationName;
    const hasDistributionInfo =
      distributionForAI.country || distributionForAI.intended_market;

    if (hasLocationData || hasDistributionInfo) {
      try {
        const aiResult = await getCachedFraudAnalysis(
          tag.code,
          distributionForAI,
          currentScanLocation,
          {
            totalScans,
            uniqueScanners,
            recentLocations: scanLocations.slice(0, 5),
          }
        );

        aiAnalysis = {
          isSuspicious: aiResult.isSuspicious,
          riskLevel: aiResult.riskLevel,
          riskScore: aiResult.riskScore,
          reasons: aiResult.reasons,
          recommendation: aiResult.recommendation,
          details: aiResult.details,
          fromCache: aiResult.fromCache,
          cacheExpiresAt: aiResult.cacheExpiresAt,
        };

        // Update overall risk if AI analysis indicates higher risk
        if (aiResult.riskScore > riskScore) {
          riskScore = aiResult.riskScore;
          overallRisk = aiResult.riskLevel;
        }

        // Add AI-generated flags to fraud flags
        if (aiResult.isSuspicious && aiResult.reasons.length > 0) {
          aiResult.reasons.forEach((reason) => {
            // Avoid duplicate flags
            const isDuplicate = fraudFlags.some(
              (f) => f.message.toLowerCase() === reason.toLowerCase()
            );
            if (!isDuplicate) {
              fraudFlags.push({
                type: 'ai_analysis',
                severity:
                  aiResult.riskLevel === 'critical' ||
                  aiResult.riskLevel === 'high'
                    ? 'danger'
                    : 'warning',
                message: reason,
              });
            }
          });
        }
      } catch (aiError) {
        console.error('AI fraud analysis error:', aiError);
        // Continue without AI analysis - rule-based analysis is still available
      }
    }

    return NextResponse.json<VerifyResponse>({
      success: true,
      tag: {
        code: tag.code,
        isStamped: isStampedInDb,
        chainStatus: chainStatus,
        chainStatusLabel: getChainStatusLabel(chainStatus),
        isRevoked,
        createdAt: tag.created_at.toISOString(),
        products: productInfo,
        distribution: distributionInfo,
      },
      blockchainValidation,
      blockchainMetadata,
      scanStats: {
        totalScans,
        uniqueScanners,
        firstScanAt: firstScan?.created_at.toISOString(),
        lastScanAt: lastScan?.created_at.toISOString(),
        scanLocations,
      },
      scanHistory,
      fraudAnalysis: {
        overallRisk,
        riskScore: Math.min(riskScore, 100),
        flags: fraudFlags,
        locationMismatch,
        suspiciousScanPattern,
        multipleLocationsInShortTime,
      },
      aiAnalysis,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json<VerifyResponse>(
      {
        success: false,
        error: 'Terjadi kesalahan saat memverifikasi tag',
        scanStats: { totalScans: 0, uniqueScanners: 0, scanLocations: [] },
        scanHistory: [],
        fraudAnalysis: {
          overallRisk: 'low',
          riskScore: 0,
          flags: [],
          locationMismatch: false,
          suspiciousScanPattern: false,
          multipleLocationsInShortTime: false,
        },
      },
      { status: 500 }
    );
  }
}
