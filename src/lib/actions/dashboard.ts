'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function getDashboardStats() {
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

    return {
      brands: brandsCount,
      products: productsCount,
      tags: tagsCount,
      stampedTags: stampedTagsCount,
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

  return {
    brands: 1, // Brand users see only their brand
    products: productIds.length,
    tags: tagsCount,
    stampedTags: stampedTagsCount,
  };
}
