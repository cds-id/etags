'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

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
