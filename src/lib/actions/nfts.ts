'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export interface NFTWithDetails {
  id: number;
  tokenId: string;
  ownerAddress: string;
  imageUrl: string;
  metadataUrl: string;
  mintTxHash: string | null;
  transferTxHash: string | null;
  createdAt: Date;
  tag: {
    id: number;
    code: string;
  };
  product: {
    code: string;
    name: string;
  } | null;
  brand: {
    id: number;
    name: string;
    logoUrl: string | null;
  } | null;
}

export interface NFTStats {
  totalMinted: number;
  mintedToday: number;
  mintedThisWeek: number;
  mintedThisMonth: number;
  byBrand: Array<{
    brandId: number;
    brandName: string;
    count: number;
  }>;
}

// Type for raw NFT from database (before Prisma client is regenerated)
interface RawTagNFT {
  id: number;
  tag_id: number;
  token_id: string;
  owner_address: string;
  image_url: string;
  metadata_url: string;
  mint_tx_hash: string | null;
  transfer_tx_hash: string | null;
  created_at: Date;
  tag?: {
    id: number;
    code: string;
    product_ids: number[] | null;
  };
}

/**
 * Get all NFTs with pagination and filters
 * Note: Uses 'any' cast until Prisma client is regenerated with TagNFT model
 */
export async function getNFTs(params: {
  page?: number;
  limit?: number;
  brandId?: number;
  search?: string;
}): Promise<{ nfts: NFTWithDetails[]; total: number }> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const { page = 1, limit = 10, search } = params;
  const skip = (page - 1) * limit;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { tag: { code: { contains: search } } },
        { owner_address: { contains: search } },
      ];
    }

    const [nfts, total] = await Promise.all([
      db.tagNFT.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          tag: true,
        },
      }) as Promise<RawTagNFT[]>,
      db.tagNFT.count({ where }) as Promise<number>,
    ]);

    // Fetch product and brand info for each NFT
    const nftsWithDetails: NFTWithDetails[] = await Promise.all(
      nfts.map(async (nft: RawTagNFT) => {
        // Get product IDs from tag
        const productIds = (nft.tag?.product_ids as number[]) || [];
        let product: { code: string; name: string } | null = null;
        let brand: { id: number; name: string; logoUrl: string | null } | null =
          null;

        if (productIds.length > 0) {
          const productData = await prisma.product.findFirst({
            where: { id: { in: productIds } },
            include: { brand: true },
          });

          if (productData) {
            const metadata = productData.metadata as { name?: string };
            product = {
              code: productData.code,
              name: metadata.name || productData.code,
            };
            brand = {
              id: productData.brand.id,
              name: productData.brand.name,
              logoUrl: productData.brand.logo_url,
            };
          }
        }

        return {
          id: nft.id,
          tokenId: nft.token_id,
          ownerAddress: nft.owner_address,
          imageUrl: nft.image_url,
          metadataUrl: nft.metadata_url,
          mintTxHash: nft.mint_tx_hash,
          transferTxHash: nft.transfer_tx_hash,
          createdAt: nft.created_at,
          tag: {
            id: nft.tag?.id || 0,
            code: nft.tag?.code || '',
          },
          product,
          brand,
        };
      })
    );

    // Filter by brand if needed (brand user restriction)
    let filteredNfts = nftsWithDetails;
    if (session.user.role === 'brand' && session.user.brandId) {
      const userBrandId = Number(session.user.brandId);
      filteredNfts = nftsWithDetails.filter(
        (nft) => nft.brand?.id === userBrandId
      );
    }

    return {
      nfts: filteredNfts,
      total: session.user.role === 'brand' ? filteredNfts.length : total,
    };
  } catch (error) {
    // TagNFT table may not exist yet
    console.error('Error fetching NFTs:', error);
    return { nfts: [], total: 0 };
  }
}

/**
 * Get NFT details by ID
 */
export async function getNFTById(id: number): Promise<NFTWithDetails | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    const nft = (await db.tagNFT.findUnique({
      where: { id },
      include: {
        tag: true,
      },
    })) as RawTagNFT | null;

    if (!nft) {
      return null;
    }

    // Get product and brand info
    const productIds = (nft.tag?.product_ids as number[]) || [];
    let product: { code: string; name: string } | null = null;
    let brand: { id: number; name: string; logoUrl: string | null } | null =
      null;

    if (productIds.length > 0) {
      const productData = await prisma.product.findFirst({
        where: { id: { in: productIds } },
        include: { brand: true },
      });

      if (productData) {
        const metadata = productData.metadata as { name?: string };
        product = {
          code: productData.code,
          name: metadata.name || productData.code,
        };
        brand = {
          id: productData.brand.id,
          name: productData.brand.name,
          logoUrl: productData.brand.logo_url,
        };

        // Check brand access for brand users
        if (
          session.user.role === 'brand' &&
          Number(session.user.brandId) !== productData.brand.id
        ) {
          throw new Error('Unauthorized');
        }
      }
    }

    return {
      id: nft.id,
      tokenId: nft.token_id,
      ownerAddress: nft.owner_address,
      imageUrl: nft.image_url,
      metadataUrl: nft.metadata_url,
      mintTxHash: nft.mint_tx_hash,
      transferTxHash: nft.transfer_tx_hash,
      createdAt: nft.created_at,
      tag: {
        id: nft.tag?.id || 0,
        code: nft.tag?.code || '',
      },
      product,
      brand,
    };
  } catch (error) {
    console.error('Error fetching NFT:', error);
    return null;
  }
}

/**
 * Get NFT statistics
 */
export async function getNFTStats(): Promise<NFTStats> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get counts
    const [totalMinted, mintedToday, mintedThisWeek, mintedThisMonth] =
      await Promise.all([
        db.tagNFT.count() as Promise<number>,
        db.tagNFT.count({
          where: { created_at: { gte: startOfDay } },
        }) as Promise<number>,
        db.tagNFT.count({
          where: { created_at: { gte: startOfWeek } },
        }) as Promise<number>,
        db.tagNFT.count({
          where: { created_at: { gte: startOfMonth } },
        }) as Promise<number>,
      ]);

    // Get counts by brand
    const allNfts = (await db.tagNFT.findMany({
      include: {
        tag: true,
      },
    })) as RawTagNFT[];

    const brandCounts = new Map<number, { name: string; count: number }>();

    for (const nft of allNfts) {
      const productIds = (nft.tag?.product_ids as number[]) || [];
      if (productIds.length > 0) {
        const productData = await prisma.product.findFirst({
          where: { id: { in: productIds } },
          include: { brand: true },
        });

        if (productData) {
          const existing = brandCounts.get(productData.brand.id);
          if (existing) {
            existing.count++;
          } else {
            brandCounts.set(productData.brand.id, {
              name: productData.brand.name,
              count: 1,
            });
          }
        }
      }
    }

    const byBrand = Array.from(brandCounts.entries()).map(
      ([brandId, data]) => ({
        brandId,
        brandName: data.name,
        count: data.count,
      })
    );

    // Filter for brand users
    if (session.user.role === 'brand' && session.user.brandId) {
      const userBrandId = Number(session.user.brandId);
      const brandStats = byBrand.find((b) => b.brandId === userBrandId);
      return {
        totalMinted: brandStats?.count || 0,
        mintedToday: 0, // Would need more complex query
        mintedThisWeek: 0,
        mintedThisMonth: 0,
        byBrand: brandStats ? [brandStats] : [],
      };
    }

    return {
      totalMinted,
      mintedToday,
      mintedThisWeek,
      mintedThisMonth,
      byBrand,
    };
  } catch (error) {
    console.error('Error fetching NFT stats:', error);
    return {
      totalMinted: 0,
      mintedToday: 0,
      mintedThisWeek: 0,
      mintedThisMonth: 0,
      byBrand: [],
    };
  }
}

/**
 * Get recent NFTs for dashboard
 */
export async function getRecentNFTs(
  limit: number = 5
): Promise<NFTWithDetails[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const result = await getNFTs({ page: 1, limit });
  return result.nfts;
}
