'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export interface DashboardStats {
  brands: number;
  products: number;
  tags: number;
  stampedTags: number;
  nfts: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const isAdmin = session.user.role === 'admin';

  // For admin users, show all stats
  if (isAdmin) {
    const [brandsCount, productsCount, tagsCount, stampedTagsCount] =
      await Promise.all([
        prisma.brand.count(),
        prisma.product.count(),
        prisma.tag.count(),
        prisma.tag.count({ where: { is_stamped: 1 } }),
      ]);

    // Count NFTs (may not exist if schema not migrated yet)
    let nftsCount = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nftsCount = await (prisma as any).tagNFT.count();
    } catch {
      // TagNFT table may not exist yet
    }

    return {
      brands: brandsCount,
      products: productsCount,
      tags: tagsCount,
      stampedTags: stampedTagsCount,
      nfts: nftsCount,
    };
  }

  // For brand users, show only their brand's stats
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { brand_id: true },
  });

  const brandId = user?.brand_id;
  if (!brandId) {
    return {
      brands: 0,
      products: 0,
      tags: 0,
      stampedTags: 0,
      nfts: 0,
    };
  }

  // Get product IDs for this brand
  const brandProducts = await prisma.product.findMany({
    where: { brand_id: brandId },
    select: { id: true },
  });
  const productIds = brandProducts.map((p) => p.id);
  const productIdsSet = new Set(productIds);

  // Count tags that contain any of the brand's products
  const allTags = await prisma.tag.findMany({
    select: { product_ids: true, is_stamped: true },
  });

  let tagsCount = 0;
  let stampedTagsCount = 0;

  for (const tag of allTags) {
    const tagProductIds = Array.isArray(tag.product_ids)
      ? (tag.product_ids as number[])
      : [];
    const belongsToBrand = tagProductIds.some((id) => productIdsSet.has(id));
    if (belongsToBrand) {
      tagsCount++;
      if (tag.is_stamped === 1) {
        stampedTagsCount++;
      }
    }
  }

  // Count NFTs for brand (may not exist if schema not migrated yet)
  let nftsCount = 0;
  try {
    // Get tags for this brand and count their NFTs
    const brandTagIds = allTags
      .filter((tag) => {
        const tagProductIds = Array.isArray(tag.product_ids)
          ? (tag.product_ids as number[])
          : [];
        return tagProductIds.some((id) => productIdsSet.has(id));
      })
      .map((_, index) => index); // Just need count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nftsCount = brandTagIds.length > 0 ? await (prisma as any).tagNFT.count() : 0;
  } catch {
    // TagNFT table may not exist yet
  }

  return {
    brands: 1, // Brand users see only their brand
    products: productIds.length,
    tags: tagsCount,
    stampedTags: stampedTagsCount,
    nfts: nftsCount,
  };
}
