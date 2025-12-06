import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processNFTClaim, isTagNFTMinted } from '@/lib/nft-collectible';
import {
  checkRateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';
import { checkCSRF } from '@/lib/csrf';
import { ethers } from 'ethers';

export type ClaimNFTRequest = {
  tagCode: string;
  fingerprintId: string;
  walletAddress: string;
};

export type ClaimNFTResponse = {
  success: boolean;
  message: string;
  nft?: {
    tokenId: string;
    imageUrl: string;
    metadataUrl: string;
    mintTxHash: string;
    ownerAddress?: string;
  };
  error?: string;
};

/**
 * POST /api/scan/claim-nft
 *
 * Claim an NFT collectible for a first-hand tag claim
 * Requirements:
 * - Tag must exist and be stamped
 * - User must have a first-hand claim on this tag
 * - NFT must not already be minted for this tag
 * - Valid wallet address required
 */
export async function POST(request: NextRequest) {
  // Get IP address for rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || '127.0.0.1';

  // CSRF validation
  const csrfCheck = await checkCSRF(request);
  if (!csrfCheck.valid) {
    return NextResponse.json<ClaimNFTResponse>(
      {
        success: false,
        message: 'Akses tidak valid',
        error: 'Silakan refresh halaman dan coba lagi.',
      },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as ClaimNFTRequest;
    const { tagCode, fingerprintId, walletAddress } = body;

    // Rate limit check (per IP + fingerprint) - use claim rate limits
    const clientId = getClientIdentifier(ipAddress, fingerprintId);
    const rateLimitResult = checkRateLimit(
      `claim-nft:${clientId}`,
      RATE_LIMITS.claim
    );

    if (!rateLimitResult.success) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Terlalu banyak permintaan',
          error: `Coba lagi dalam ${rateLimitResult.retryAfter} detik.`,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Validate required fields
    if (!tagCode || !fingerprintId || !walletAddress) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Data tidak lengkap',
          error: 'Tag code, fingerprint ID, dan wallet address diperlukan',
        },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Alamat wallet tidak valid',
          error: 'Silakan gunakan alamat wallet Ethereum yang valid',
        },
        { status: 400 }
      );
    }

    // Find the tag
    const tag = await prisma.tag.findUnique({
      where: { code: tagCode },
      include: {
        nft: true,
      },
    });

    if (!tag) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Tag tidak ditemukan',
          error: 'Tag tidak ditemukan',
        },
        { status: 404 }
      );
    }

    // Check if tag is stamped
    if (tag.is_stamped !== 1) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Tag belum di-stamp',
          error:
            'NFT hanya tersedia untuk tag yang sudah di-stamp ke blockchain',
        },
        { status: 400 }
      );
    }

    // Check if NFT already minted (database check)
    if (tag.nft) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'NFT sudah di-mint',
          error: 'NFT untuk tag ini sudah di-claim oleh pengguna lain',
        },
        { status: 400 }
      );
    }

    // Also check on-chain
    const alreadyMinted = await isTagNFTMinted(tagCode);
    if (alreadyMinted) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'NFT sudah di-mint',
          error: 'NFT untuk tag ini sudah ada di blockchain',
        },
        { status: 400 }
      );
    }

    // Verify user has a first-hand claim on this tag
    const firstHandClaim = await prisma.tagScan.findFirst({
      where: {
        tag_id: tag.id,
        fingerprint_id: fingerprintId,
        is_claimed: 1,
        is_first_hand: 1,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!firstHandClaim) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Klaim tidak valid',
          error:
            'Anda harus melakukan klaim sebagai pemilik pertama (first-hand) terlebih dahulu',
        },
        { status: 400 }
      );
    }

    // Process NFT claim
    console.log('Processing NFT claim for:', { tagCode, walletAddress });
    const result = await processNFTClaim(tagCode, walletAddress);

    if (!result.success) {
      return NextResponse.json<ClaimNFTResponse>(
        {
          success: false,
          message: 'Gagal mint NFT',
          error: result.error || 'Terjadi kesalahan saat mint NFT',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ClaimNFTResponse>({
      success: true,
      message:
        'Selamat! NFT Collectible Anda berhasil di-mint dan dikirim ke wallet Anda.',
      nft: {
        tokenId: result.tokenId!,
        imageUrl: result.imageUrl!,
        metadataUrl: result.metadataUrl!,
        mintTxHash: result.mintTxHash!,
      },
    });
  } catch (error) {
    console.error('Claim NFT error:', error);
    return NextResponse.json<ClaimNFTResponse>(
      {
        success: false,
        message: 'Terjadi kesalahan',
        error: 'Terjadi kesalahan saat memproses klaim NFT',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scan/claim-nft?tagCode=XXX
 *
 * Check if NFT is available to claim for a tag
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tagCode = searchParams.get('tagCode');

  if (!tagCode) {
    return NextResponse.json(
      { error: 'tagCode parameter is required' },
      { status: 400 }
    );
  }

  try {
    const tag = await prisma.tag.findUnique({
      where: { code: tagCode },
      include: {
        nft: true,
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const nftMinted = !!tag.nft || (await isTagNFTMinted(tagCode));

    return NextResponse.json({
      tagCode,
      isStamped: tag.is_stamped === 1,
      nftAvailable: tag.is_stamped === 1 && !nftMinted,
      nftMinted,
      nft: tag.nft
        ? {
            tokenId: tag.nft.token_id,
            imageUrl: tag.nft.image_url,
            ownerAddress: tag.nft.owner_address,
          }
        : null,
    });
  } catch (error) {
    console.error('Check NFT availability error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
