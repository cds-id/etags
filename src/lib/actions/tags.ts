'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { TagMetadata } from '@/lib/product-templates';

export type TagFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// Helper to check admin role
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

// Generate unique tag code
function generateTagCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TAG-${timestamp}-${random}`;
}

// Get all tags with pagination
export async function getTags(page: number = 1, limit: number = 10) {
  await requireAdmin();

  const skip = (page - 1) * limit;

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    prisma.tag.count(),
  ]);

  // Fetch related products for each tag
  const tagsWithProducts = await Promise.all(
    tags.map(async (tag) => {
      const productIds = tag.product_ids as number[];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          code: true,
          metadata: true,
          brand: {
            select: { id: true, name: true },
          },
        },
      });
      return { ...tag, products };
    })
  );

  return {
    tags: tagsWithProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get single tag by ID
export async function getTagById(id: number) {
  await requireAdmin();

  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) return null;

  // Fetch related products
  const productIds = tag.product_ids as number[];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      code: true,
      metadata: true,
      brand: {
        select: { id: true, name: true },
      },
    },
  });

  return { ...tag, products };
}

// Get tag by code (for public lookup)
export async function getTagByCode(code: string) {
  const tag = await prisma.tag.findUnique({
    where: { code },
  });

  if (!tag || tag.publish_status !== 1) return null;

  // Fetch related products
  const productIds = tag.product_ids as number[];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 1 },
    select: {
      id: true,
      code: true,
      metadata: true,
      brand: {
        select: { id: true, name: true, logo_url: true },
      },
    },
  });

  return { ...tag, products };
}

// Create tag
export async function createTag(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  try {
    await requireAdmin();

    const productIdsJson = formData.get('product_ids') as string;
    const metadataJson = formData.get('metadata') as string;
    const publishStatus =
      parseInt(formData.get('publish_status') as string) || 0;

    let productIds: number[] = [];
    let metadata: TagMetadata = {};

    try {
      productIds = JSON.parse(productIdsJson || '[]');
      metadata = JSON.parse(metadataJson || '{}');
    } catch {
      return { error: 'Invalid data format' };
    }

    if (productIds.length === 0) {
      return { error: 'At least one product is required' };
    }

    // Verify all products exist
    const productsCount = await prisma.product.count({
      where: { id: { in: productIds } },
    });

    if (productsCount !== productIds.length) {
      return { error: 'One or more selected products do not exist' };
    }

    const code = generateTagCode();

    await prisma.tag.create({
      data: {
        code,
        product_ids: productIds,
        metadata: metadata as object,
        publish_status: publishStatus,
        is_stamped: 0,
        chain_status: null,
      },
    });

    revalidatePath('/manage/tags');
    return { success: true, message: 'Tag created successfully' };
  } catch (error) {
    console.error('Create tag error:', error);
    return { error: 'Failed to create tag' };
  }
}

// Update tag
export async function updateTag(
  id: number,
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  try {
    await requireAdmin();

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: { is_stamped: true },
    });

    if (!tag) {
      return { error: 'Tag not found' };
    }

    // Don't allow editing stamped tags (except publish_status)
    if (tag.is_stamped === 1) {
      const publishStatus =
        parseInt(formData.get('publish_status') as string) || 0;

      await prisma.tag.update({
        where: { id },
        data: { publish_status: publishStatus },
      });

      revalidatePath('/manage/tags');
      return { success: true, message: 'Tag publish status updated' };
    }

    const productIdsJson = formData.get('product_ids') as string;
    const metadataJson = formData.get('metadata') as string;
    const publishStatus =
      parseInt(formData.get('publish_status') as string) || 0;

    let productIds: number[] = [];
    let metadata: TagMetadata = {};

    try {
      productIds = JSON.parse(productIdsJson || '[]');
      metadata = JSON.parse(metadataJson || '{}');
    } catch {
      return { error: 'Invalid data format' };
    }

    if (productIds.length === 0) {
      return { error: 'At least one product is required' };
    }

    // Verify all products exist
    const productsCount = await prisma.product.count({
      where: { id: { in: productIds } },
    });

    if (productsCount !== productIds.length) {
      return { error: 'One or more selected products do not exist' };
    }

    await prisma.tag.update({
      where: { id },
      data: {
        product_ids: productIds,
        metadata: metadata as object,
        publish_status: publishStatus,
      },
    });

    revalidatePath('/manage/tags');
    return { success: true, message: 'Tag updated successfully' };
  } catch (error) {
    console.error('Update tag error:', error);
    return { error: 'Failed to update tag' };
  }
}

// Delete tag
export async function deleteTag(id: number): Promise<TagFormState> {
  try {
    await requireAdmin();

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: { is_stamped: true },
    });

    if (!tag) {
      return { error: 'Tag not found' };
    }

    // Don't allow deleting stamped tags
    if (tag.is_stamped === 1) {
      return {
        error: 'Cannot delete a tag that has been stamped to blockchain',
      };
    }

    await prisma.tag.delete({
      where: { id },
    });

    revalidatePath('/manage/tags');
    return { success: true, message: 'Tag deleted successfully' };
  } catch (error) {
    console.error('Delete tag error:', error);
    return { error: 'Failed to delete tag' };
  }
}

// Toggle tag publish status
export async function toggleTagPublishStatus(
  id: number
): Promise<TagFormState> {
  try {
    await requireAdmin();

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: { publish_status: true },
    });

    if (!tag) {
      return { error: 'Tag not found' };
    }

    await prisma.tag.update({
      where: { id },
      data: { publish_status: tag.publish_status === 1 ? 0 : 1 },
    });

    revalidatePath('/manage/tags');
    return { success: true, message: 'Tag publish status updated' };
  } catch (error) {
    console.error('Toggle tag publish status error:', error);
    return { error: 'Failed to update tag publish status' };
  }
}
