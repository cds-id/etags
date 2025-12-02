import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ProductMetadata, TagMetadata } from '@/lib/product-templates';
import { analyzeFraud, quickFraudCheck } from '@/lib/fraud-detection';
import { fetchTagMetadata } from '@/lib/tag-stamping';
import { validateTagOnChain } from '@/lib/tag-sync';
import { CHAIN_STATUS, getChainStatusLabel } from '@/lib/constants';
import {
  checkRateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';
import { checkCSRF } from '@/lib/csrf';

export type ScanRequest = {
  tagCode: string;
  fingerprintId: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
};

export type ScanResponse = {
  success: boolean;
  valid: boolean;
  isRevoked?: boolean;
  tag?: {
    code: string;
    isStamped: boolean;
    chainStatus: number | null;
    chainStatusLabel: string;
    products: Array<{
      code: string;
      name: string;
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
    isRevoked: boolean;
    revokedMessage?: string;
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
  scanInfo: {
    scanNumber: number;
    totalScans: number;
    isNewFingerprint: boolean;
    previousScansFromFingerprint: number;
  };
  fraudAnalysis?: {
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    reasons: string[];
    recommendation: string;
  };
  question?: {
    type: 'first_scan' | 'second_scan' | 'third_scan' | 'no_question';
    message: string;
    options?: string[];
  };
  history?: Array<{
    scanNumber: number;
    createdAt: string;
    isFirstHand: boolean | null;
    sourceInfo: string | null;
  }>;
  error?: string;
};

/**
 * POST /api/scan
 *
 * Scan a tag and record the scan with fingerprint, IP, user agent
 */
export async function POST(request: NextRequest) {
  // Get IP address early for rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || '127.0.0.1';
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // CSRF validation
  const csrfCheck = await checkCSRF(request);
  if (!csrfCheck.valid) {
    return NextResponse.json<ScanResponse>(
      {
        success: false,
        valid: false,
        scanInfo: {
          scanNumber: 0,
          totalScans: 0,
          isNewFingerprint: false,
          previousScansFromFingerprint: 0,
        },
        error: 'Akses tidak valid. Silakan refresh halaman dan coba lagi.',
      },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as ScanRequest;
    const { tagCode, fingerprintId, latitude, longitude, locationName } = body;

    // Rate limit check (per IP + fingerprint)
    const clientId = getClientIdentifier(ipAddress, fingerprintId);
    const rateLimitResult = checkRateLimit(
      `scan:${clientId}`,
      RATE_LIMITS.scan
    );

    if (!rateLimitResult.success) {
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          valid: false,
          scanInfo: {
            scanNumber: 0,
            totalScans: 0,
            isNewFingerprint: false,
            previousScansFromFingerprint: 0,
          },
          error: `Terlalu banyak permintaan. Coba lagi dalam ${rateLimitResult.retryAfter} detik.`,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    if (!tagCode || !fingerprintId) {
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          valid: false,
          scanInfo: {
            scanNumber: 0,
            totalScans: 0,
            isNewFingerprint: false,
            previousScansFromFingerprint: 0,
          },
          error: 'Kode tag dan fingerprint ID diperlukan',
        },
        { status: 400 }
      );
    }

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
      return NextResponse.json<ScanResponse>(
        {
          success: false,
          valid: false,
          scanInfo: {
            scanNumber: 0,
            totalScans: 0,
            isNewFingerprint: false,
            previousScansFromFingerprint: 0,
          },
          error: 'Tag tidak ditemukan',
        },
        { status: 404 }
      );
    }

    // Check if tag is stamped (valid in database)
    const isStampedInDb = tag.is_stamped === 1;

    // Validate tag on blockchain if it's stamped
    let blockchainValidation: ScanResponse['blockchainValidation'] = undefined;
    let isRevoked = false;
    let isValid = isStampedInDb;

    if (isStampedInDb) {
      const chainValidation = await validateTagOnChain(tag.code);

      if (chainValidation) {
        const chainStatus = chainValidation.status ?? null;
        isRevoked = chainStatus === CHAIN_STATUS.REVOKED;

        // If revoked on blockchain, tag is not valid
        if (isRevoked) {
          isValid = false;
        }

        blockchainValidation = {
          isValidOnChain: chainValidation.isValid,
          chainStatus: chainStatus,
          chainStatusLabel: getChainStatusLabel(chainStatus),
          metadataUri: chainValidation.metadataUri,
          createdAt: chainValidation.createdAt?.toISOString(),
          isRevoked,
          revokedMessage: isRevoked
            ? 'Tag ini telah dicabut (revoked) dari blockchain. Produk mungkin palsu atau tidak sah.'
            : undefined,
        };

        // Sync chain status to database if different
        if (chainStatus !== null && chainStatus !== tag.chain_status) {
          await prisma.tag.update({
            where: { id: tag.id },
            data: { chain_status: chainStatus },
          });
        }
      } else {
        // Could not validate on chain - tag might not exist on blockchain
        blockchainValidation = {
          isValidOnChain: false,
          chainStatus: null,
          chainStatusLabel: 'Tidak ditemukan di blockchain',
          isRevoked: false,
        };
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

    const productInfo = products.map((p: (typeof products)[number]) => {
      const metadata = p.metadata as ProductMetadata;
      return {
        code: p.code,
        name: metadata.name || p.code,
        brand: p.brand.name,
        brandLogo: p.brand.logo_url || undefined,
        images: metadata.images || [],
      };
    });

    // Calculate scan statistics
    type TagScan = (typeof tag.scans)[number];
    const totalScans = tag.scans.length;
    const scansFromFingerprint = tag.scans.filter(
      (s: TagScan) => s.fingerprint_id === fingerprintId
    );
    const previousScansFromFingerprint = scansFromFingerprint.length;
    const isNewFingerprint = previousScansFromFingerprint === 0;

    // Count unique fingerprints that have scanned this tag
    const uniqueFingerprints = new Set(
      tag.scans.map((s: TagScan) => s.fingerprint_id)
    );
    const uniqueScannerCount = uniqueFingerprints.size;

    // Determine what question to ask (based on unique scanners, not total scans)
    let question: ScanResponse['question'];

    if (isNewFingerprint) {
      // This is a new device scanning
      if (uniqueScannerCount === 0) {
        // First ever scanner
        question = {
          type: 'first_scan',
          message:
            'Selamat! Anda adalah pemindai pertama tag ini. Apakah Anda pemilik pertama (tangan pertama) produk ini?',
          options: [
            'Ya, saya pemilik pertama',
            'Tidak, saya mendapat dari orang lain',
          ],
        };
      } else if (uniqueScannerCount === 1) {
        // Second unique scanner
        question = {
          type: 'second_scan',
          message:
            'Tag ini sudah pernah dipindai oleh orang lain. Apakah Anda mendapat produk ini sebagai barang second hand? Dari mana Anda mendapatkannya?',
          options: [
            'Ya, second hand - dari toko online',
            'Ya, second hand - dari teman/keluarga',
            'Ya, second hand - dari toko fisik',
            'Tidak, saya pemilik pertama',
          ],
        };
      } else if (uniqueScannerCount === 2) {
        // Third unique scanner
        question = {
          type: 'third_scan',
          message: 'Dari mana Anda mendapatkan produk ini?',
          options: [
            'Toko online (marketplace)',
            'Toko fisik / offline store',
            'Teman / keluarga',
            'Hadiah / gift',
            'Lainnya',
          ],
        };
      } else {
        // More than 3 unique scanners - no question, just show history
        question = {
          type: 'no_question',
          message: '',
        };
      }
    } else {
      // Same device scanning again - no question
      question = {
        type: 'no_question',
        message: '',
      };
    }

    // Create scan record
    const newScan = await prisma.tagScan.create({
      data: {
        tag_id: tag.id,
        fingerprint_id: fingerprintId,
        ip_address: ipAddress,
        user_agent: userAgent,
        latitude: latitude || null,
        longitude: longitude || null,
        location_name: locationName || null,
        scan_number: totalScans + 1,
      },
    });

    // Build history for display (only if more than 3 unique scanners)
    const history: ScanResponse['history'] =
      uniqueScannerCount >= 3 || question?.type === 'no_question'
        ? [
            {
              scanNumber: totalScans + 1,
              createdAt: newScan.created_at.toISOString(),
              isFirstHand: null,
              sourceInfo: null,
            },
            ...tag.scans.map((s: TagScan) => ({
              scanNumber: s.scan_number,
              createdAt: s.created_at.toISOString(),
              isFirstHand:
                s.is_first_hand === 1
                  ? true
                  : s.is_first_hand === 0
                    ? false
                    : null,
              sourceInfo: s.source_info,
            })),
          ]
        : undefined;

    // Perform fraud detection if location is available and tag has distribution info
    let fraudAnalysis: ScanResponse['fraudAnalysis'] = undefined;

    if (
      locationName &&
      (distributionInfo.country || distributionInfo.intendedMarket)
    ) {
      // Get recent scan locations for context
      const recentLocations = tag.scans
        .filter((s: TagScan) => s.location_name)
        .slice(0, 5)
        .map((s: TagScan) => s.location_name as string);

      try {
        // Use AI-powered fraud detection
        const analysis = await analyzeFraud(
          {
            region: distributionInfo.region,
            country: distributionInfo.country,
            channel: distributionInfo.channel,
            intended_market: distributionInfo.intendedMarket,
          },
          {
            latitude,
            longitude,
            locationName,
            ipAddress,
          },
          {
            totalScans: totalScans + 1,
            uniqueScanners: uniqueScannerCount + (isNewFingerprint ? 1 : 0),
            recentLocations,
          }
        );

        fraudAnalysis = {
          isSuspicious: analysis.isSuspicious,
          riskLevel: analysis.riskLevel,
          riskScore: analysis.riskScore,
          reasons: analysis.reasons,
          recommendation: analysis.recommendation,
        };
      } catch (error) {
        console.error('Fraud detection error:', error);
        // Fall back to quick rule-based check
        const quickCheck = quickFraudCheck(
          {
            region: distributionInfo.region,
            country: distributionInfo.country,
            channel: distributionInfo.channel,
            intended_market: distributionInfo.intendedMarket,
          },
          { locationName, ipAddress }
        );

        if (quickCheck.isSuspicious) {
          fraudAnalysis = {
            isSuspicious: true,
            riskLevel: 'medium',
            riskScore: 50,
            reasons: quickCheck.reason ? [quickCheck.reason] : [],
            recommendation: 'Periksa keaslian produk dengan teliti.',
          };
        }
      }
    }

    // Fetch blockchain metadata if tag is stamped
    let blockchainMetadata: ScanResponse['blockchainMetadata'] = undefined;

    if (isValid) {
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
      }
    }

    return NextResponse.json<ScanResponse>({
      success: true,
      valid: isValid,
      isRevoked,
      tag: {
        code: tag.code,
        isStamped: tag.is_stamped === 1,
        chainStatus: blockchainValidation?.chainStatus ?? tag.chain_status,
        chainStatusLabel:
          blockchainValidation?.chainStatusLabel ||
          getChainStatusLabel(tag.chain_status),
        products: productInfo,
        distribution: distributionInfo,
      },
      blockchainValidation,
      blockchainMetadata,
      scanInfo: {
        scanNumber: totalScans + 1,
        totalScans: totalScans + 1,
        isNewFingerprint,
        previousScansFromFingerprint,
      },
      fraudAnalysis,
      question,
      history,
    });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json<ScanResponse>(
      {
        success: false,
        valid: false,
        scanInfo: {
          scanNumber: 0,
          totalScans: 0,
          isNewFingerprint: false,
          previousScansFromFingerprint: 0,
        },
        error: 'Terjadi kesalahan saat memproses scan',
      },
      { status: 500 }
    );
  }
}
