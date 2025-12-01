import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export type ClaimRequest = {
  tagCode: string;
  fingerprintId: string;
  isFirstHand: boolean;
  sourceInfo?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
};

export type ClaimResponse = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * POST /api/scan/claim
 *
 * Claim a tag and record the user's answer about ownership
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClaimRequest;
    const { tagCode, fingerprintId, isFirstHand, sourceInfo, latitude, longitude, locationName } =
      body;

    if (!tagCode || !fingerprintId) {
      return NextResponse.json<ClaimResponse>(
        {
          success: false,
          message: 'Gagal mencatat klaim',
          error: 'Kode tag dan fingerprint ID diperlukan',
        },
        { status: 400 }
      );
    }

    // Find the tag
    const tag = await prisma.tag.findUnique({
      where: { code: tagCode },
    });

    if (!tag) {
      return NextResponse.json<ClaimResponse>(
        {
          success: false,
          message: 'Tag tidak ditemukan',
          error: 'Tag tidak ditemukan',
        },
        { status: 404 }
      );
    }

    // Find the most recent scan from this fingerprint for this tag
    const latestScan = await prisma.tagScan.findFirst({
      where: {
        tag_id: tag.id,
        fingerprint_id: fingerprintId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!latestScan) {
      return NextResponse.json<ClaimResponse>(
        {
          success: false,
          message: 'Scan tidak ditemukan',
          error: 'Anda harus scan terlebih dahulu sebelum klaim',
        },
        { status: 400 }
      );
    }

    // Update the scan with claim information
    await prisma.tagScan.update({
      where: { id: latestScan.id },
      data: {
        is_claimed: 1,
        is_first_hand: isFirstHand ? 1 : 0,
        source_info: sourceInfo || null,
        latitude: latitude ?? latestScan.latitude,
        longitude: longitude ?? latestScan.longitude,
        location_name: locationName ?? latestScan.location_name,
      },
    });

    return NextResponse.json<ClaimResponse>({
      success: true,
      message: isFirstHand
        ? 'Terima kasih! Anda telah dikonfirmasi sebagai pemilik pertama.'
        : 'Terima kasih! Informasi Anda telah dicatat.',
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json<ClaimResponse>(
      {
        success: false,
        message: 'Terjadi kesalahan',
        error: 'Terjadi kesalahan saat memproses klaim',
      },
      { status: 500 }
    );
  }
}
