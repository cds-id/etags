import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ProductMetadata } from '@/lib/product-templates';

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
  tag?: {
    code: string;
    isStamped: boolean;
    chainStatus: number | null;
    products: Array<{
      code: string;
      name: string;
      brand: string;
      brandLogo?: string;
      images?: string[];
    }>;
  };
  scanInfo: {
    scanNumber: number;
    totalScans: number;
    isNewFingerprint: boolean;
    previousScansFromFingerprint: number;
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
  try {
    const body = (await request.json()) as ScanRequest;
    const { tagCode, fingerprintId, latitude, longitude, locationName } = body;

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

    // Get IP address and user agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor
      ? forwardedFor.split(',')[0].trim()
      : request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

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

    // Check if tag is stamped (valid)
    const isValid = tag.is_stamped === 1;

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
        brand: p.brand.name,
        brandLogo: p.brand.logo_url || undefined,
        images: metadata.images || [],
      };
    });

    // Calculate scan statistics
    const totalScans = tag.scans.length;
    const scansFromFingerprint = tag.scans.filter(
      (s) => s.fingerprint_id === fingerprintId
    );
    const previousScansFromFingerprint = scansFromFingerprint.length;
    const isNewFingerprint = previousScansFromFingerprint === 0;

    // Count unique fingerprints that have scanned this tag
    const uniqueFingerprints = new Set(tag.scans.map((s) => s.fingerprint_id));
    const uniqueScannerCount = uniqueFingerprints.size;

    // Calculate which scan number this is for the current fingerprint
    const fingerprintScanNumber = previousScansFromFingerprint + 1;

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
          options: ['Ya, saya pemilik pertama', 'Tidak, saya mendapat dari orang lain'],
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
    let history: ScanResponse['history'] = undefined;
    if (uniqueScannerCount >= 3 || question?.type === 'no_question') {
      history = tag.scans.map((s) => ({
        scanNumber: s.scan_number,
        createdAt: s.created_at.toISOString(),
        isFirstHand: s.is_first_hand === 1 ? true : s.is_first_hand === 0 ? false : null,
        sourceInfo: s.source_info,
      }));
      // Add current scan to history
      history.unshift({
        scanNumber: totalScans + 1,
        createdAt: newScan.created_at.toISOString(),
        isFirstHand: null,
        sourceInfo: null,
      });
    }

    return NextResponse.json<ScanResponse>({
      success: true,
      valid: isValid,
      tag: {
        code: tag.code,
        isStamped: tag.is_stamped === 1,
        chainStatus: tag.chain_status,
        products: productInfo,
      },
      scanInfo: {
        scanNumber: totalScans + 1,
        totalScans: totalScans + 1,
        isNewFingerprint,
        previousScansFromFingerprint,
      },
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
