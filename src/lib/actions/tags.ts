'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { TagMetadata } from '@/lib/product-templates';
import {
  stampTag as stampTagService,
  previewTagStamping,
  getTagMetadataUrl,
  getTagQRCodeUrl,
  type TagStaticMetadata,
} from '@/lib/tag-stamping';
import { updateTagChainStatus, revokeTagOnChain } from '@/lib/tag-sync';
import { type ChainStatus, CHAIN_STATUS } from '@/lib/constants';

export type TagFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// Helper to require authentication and get user context
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const isAdmin = session.user.role === 'admin';

  // Get brand_id for brand users
  let brandId: number | null = null;
  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { brand_id: true },
    });
    brandId = user?.brand_id || null;

    if (!brandId) {
      throw new Error('Brand user must have a brand assigned');
    }
  }

  return { session, isAdmin, brandId };
}

// Helper to get product IDs for a brand
async function getBrandProductIds(brandId: number): Promise<number[]> {
  const products = await prisma.product.findMany({
    where: { brand_id: brandId },
    select: { id: true },
  });
  return products.map((p) => p.id);
}

// Helper to check if tag belongs to user's brand
async function tagBelongsToBrand(
  tagId: number,
  brandId: number
): Promise<boolean> {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    select: { product_ids: true },
  });

  if (!tag) return false;

  const productIds = tag.product_ids as number[];
  if (productIds.length === 0) return false;

  // Check if any of the tag's products belong to the brand
  const brandProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      brand_id: brandId,
    },
    select: { id: true },
  });

  return brandProducts.length > 0;
}

// Generate unique tag code
function generateTagCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TAG-${timestamp}-${random}`;
}

// Get all tags with pagination
export async function getTags(page: number = 1, limit: number = 10) {
  const { isAdmin, brandId: userBrandId } = await requireAuth();

  const skip = (page - 1) * limit;

  // For brand users, only get tags that contain their products
  let brandProductIds: number[] = [];
  if (!isAdmin && userBrandId) {
    brandProductIds = await getBrandProductIds(userBrandId);
  }

  // Get all tags first, then filter for brand users
  const allTags = await prisma.tag.findMany({
    orderBy: { created_at: 'desc' },
  });

  // Filter tags for brand users
  let filteredTags = allTags;
  if (!isAdmin) {
    filteredTags = allTags.filter((tag) => {
      const productIds = tag.product_ids as number[];
      return productIds.some((id) => brandProductIds.includes(id));
    });
  }

  const total = filteredTags.length;
  const paginatedTags = filteredTags.slice(skip, skip + limit);

  // Fetch related products for each tag
  const tagsWithProducts = await Promise.all(
    paginatedTags.map(async (tag) => {
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
  const { isAdmin, brandId: userBrandId } = await requireAuth();

  const tag = await prisma.tag.findUnique({
    where: { id },
  });

  if (!tag) return null;

  // Check if brand user can access this tag
  if (!isAdmin && userBrandId) {
    const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
    if (!belongsToBrand) {
      throw new Error('Unauthorized: Cannot access this tag');
    }
  }

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
    const { isAdmin, brandId: userBrandId } = await requireAuth();

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

    // For brand users, verify products belong to their brand
    if (!isAdmin && userBrandId) {
      const brandProductIds = await getBrandProductIds(userBrandId);
      const allProductsBelongToBrand = productIds.every((id) =>
        brandProductIds.includes(id)
      );
      if (!allProductsBelongToBrand) {
        return { error: 'You can only create tags for your own products' };
      }
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
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return { error: 'Unauthorized: Cannot update this tag' };
      }
    }

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

    // For brand users, verify products belong to their brand
    if (!isAdmin && userBrandId) {
      const brandProductIds = await getBrandProductIds(userBrandId);
      const allProductsBelongToBrand = productIds.every((id) =>
        brandProductIds.includes(id)
      );
      if (!allProductsBelongToBrand) {
        return { error: 'You can only use your own products in tags' };
      }
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
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return { error: 'Unauthorized: Cannot delete this tag' };
      }
    }

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
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return { error: 'Unauthorized: Cannot update this tag' };
      }
    }

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

// ============================================
// Blockchain Stamping Actions
// ============================================

export type StampingFormState = {
  error?: string;
  success?: boolean;
  message?: string;
  data?: {
    metadataUrl: string;
    qrCodeUrl: string;
    txHash: string;
  };
};

export type PreviewStampingResult = {
  success: boolean;
  error?: string;
  metadata?: TagStaticMetadata;
  canStamp?: boolean;
  reasons?: string[];
};

// Preview what will be stamped (for confirmation dialog)
export async function getStampingPreview(
  id: number
): Promise<PreviewStampingResult> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return {
          success: false,
          error: 'Unauthorized: Cannot access this tag',
        };
      }
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return { success: false, error: 'Tag not found' };
    }

    // Check if tag can be stamped
    const reasons: string[] = [];

    if (tag.is_stamped === 1) {
      reasons.push('Tag is already stamped to blockchain');
    }

    if (tag.publish_status !== 1) {
      reasons.push('Tag must be published before stamping');
    }

    const productIds = tag.product_ids as number[];
    if (productIds.length === 0) {
      reasons.push('Tag must have at least one product linked');
    }

    const canStamp = reasons.length === 0;

    // Get preview metadata
    const preview = await previewTagStamping(id);

    if (!preview.success) {
      return { success: false, error: preview.error };
    }

    return {
      success: true,
      metadata: preview.metadata,
      canStamp,
      reasons: reasons.length > 0 ? reasons : undefined,
    };
  } catch (error) {
    console.error('Get stamping preview error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Stamp tag to blockchain (full flow)
export async function stampTagToBlockchain(
  id: number
): Promise<StampingFormState> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return { success: false, error: 'Unauthorized: Cannot stamp this tag' };
      }
    }

    const result = await stampTagService(id);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath('/manage/tags');
    revalidatePath(`/manage/tags/${id}/edit`);

    return {
      success: true,
      message: 'Tag successfully stamped to blockchain',
      data: result.data,
    };
  } catch (error) {
    console.error('Stamp tag error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stamp tag',
    };
  }
}

// Update chain status for stamped tag (cannot set to REVOKED - use revokeTagOnBlockchain)
export async function updateChainStatus(
  id: number,
  newStatus: ChainStatus
): Promise<TagFormState> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return { error: 'Unauthorized: Cannot update this tag' };
      }
    }

    // Cannot use this function to set REVOKED status
    if (newStatus === CHAIN_STATUS.REVOKED) {
      return { error: 'Use revokeTagOnBlockchain to revoke a tag' };
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: { code: true, is_stamped: true, chain_status: true },
    });

    if (!tag) {
      return { error: 'Tag not found' };
    }

    if (tag.is_stamped !== 1) {
      return { error: 'Tag must be stamped before updating chain status' };
    }

    // Cannot update if already revoked
    if (tag.chain_status === CHAIN_STATUS.REVOKED) {
      return { error: 'Cannot update status of a revoked tag' };
    }

    // Update on blockchain
    const result = await updateTagChainStatus(tag.code, newStatus);

    if (!result.success) {
      return { error: 'Failed to update status on blockchain' };
    }

    revalidatePath('/manage/tags');
    revalidatePath(`/manage/tags/${id}/edit`);

    return {
      success: true,
      message: `Chain status updated successfully`,
    };
  } catch (error) {
    console.error('Update chain status error:', error);
    return { error: 'Failed to update chain status' };
  }
}

// Revoke tag on blockchain (irreversible)
export async function revokeTagOnBlockchain(
  id: number,
  reason: string
): Promise<TagFormState> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return { error: 'Unauthorized: Cannot revoke this tag' };
      }
    }

    if (!reason || reason.trim().length === 0) {
      return { error: 'Reason is required for revoking a tag' };
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: { code: true, is_stamped: true, chain_status: true },
    });

    if (!tag) {
      return { error: 'Tag not found' };
    }

    if (tag.is_stamped !== 1) {
      return { error: 'Tag must be stamped before revoking' };
    }

    if (tag.chain_status === CHAIN_STATUS.REVOKED) {
      return { error: 'Tag is already revoked' };
    }

    // Revoke on blockchain
    const result = await revokeTagOnChain(tag.code, reason);

    if (!result.success) {
      return { error: 'Failed to revoke tag on blockchain' };
    }

    revalidatePath('/manage/tags');
    revalidatePath(`/manage/tags/${id}/edit`);

    return {
      success: true,
      message: 'Tag has been revoked on blockchain',
    };
  } catch (error) {
    console.error('Revoke tag error:', error);
    return { error: 'Failed to revoke tag' };
  }
}

// Get tag URLs (for stamped tags)
export async function getTagUrls(
  id: number
): Promise<{ metadataUrl: string; qrCodeUrl: string } | null> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(id, userBrandId);
      if (!belongsToBrand) {
        return null;
      }
    }

    const tag = await prisma.tag.findUnique({
      where: { id },
      select: { code: true, is_stamped: true },
    });

    if (!tag || tag.is_stamped !== 1) {
      return null;
    }

    return {
      metadataUrl: getTagMetadataUrl(tag.code),
      qrCodeUrl: getTagQRCodeUrl(tag.code),
    };
  } catch (error) {
    console.error('Get tag URLs error:', error);
    return null;
  }
}

// Get tag scan history
export type TagScanInfo = {
  id: number;
  fingerprintId: string;
  ipAddress: string;
  userAgent: string;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  isClaimed: boolean;
  isFirstHand: boolean | null;
  sourceInfo: string | null;
  scanNumber: number;
  createdAt: Date;
};

export type TagScansResult = {
  scans: TagScanInfo[];
  totalScans: number;
  uniqueScanners: number;
  claimedCount: number;
  firstHandCount: number;
  secondHandCount: number;
};

export async function getTagScans(
  tagId: number
): Promise<TagScansResult | null> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Check authorization for brand users
    if (!isAdmin && userBrandId) {
      const belongsToBrand = await tagBelongsToBrand(tagId, userBrandId);
      if (!belongsToBrand) {
        return null;
      }
    }

    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      select: { id: true },
    });

    if (!tag) {
      return null;
    }

    const scans = await prisma.tagScan.findMany({
      where: { tag_id: tagId },
      orderBy: { created_at: 'desc' },
    });

    const uniqueFingerprints = new Set(scans.map((s) => s.fingerprint_id));

    return {
      scans: scans.map((s) => ({
        id: s.id,
        fingerprintId: s.fingerprint_id,
        ipAddress: s.ip_address,
        userAgent: s.user_agent,
        latitude: s.latitude,
        longitude: s.longitude,
        locationName: s.location_name,
        isClaimed: s.is_claimed === 1,
        isFirstHand:
          s.is_first_hand === 1 ? true : s.is_first_hand === 0 ? false : null,
        sourceInfo: s.source_info,
        scanNumber: s.scan_number,
        createdAt: s.created_at,
      })),
      totalScans: scans.length,
      uniqueScanners: uniqueFingerprints.size,
      claimedCount: scans.filter((s) => s.is_claimed === 1).length,
      firstHandCount: scans.filter((s) => s.is_first_hand === 1).length,
      secondHandCount: scans.filter((s) => s.is_first_hand === 0).length,
    };
  } catch (error) {
    console.error('Get tag scans error:', error);
    return null;
  }
}

// ============================================
// Tag Scan Map & Statistics
// ============================================

export type ScanLocationPoint = {
  id: number;
  tagId: number;
  tagCode: string;
  latitude: number;
  longitude: number;
  locationName: string | null;
  isClaimed: boolean;
  createdAt: Date;
};

export type TagScanMapStats = {
  totalScans: number;
  scansWithLocation: number;
  uniqueScanners: number;
  claimedCount: number;
  firstHandCount: number;
  secondHandCount: number;
  locations: ScanLocationPoint[];
};

// Get all tag scan locations for map display (with stats)
export async function getAllTagScanLocations(): Promise<TagScanMapStats> {
  try {
    const { isAdmin, brandId: userBrandId } = await requireAuth();

    // Get tag IDs the user has access to
    let accessibleTagIds: number[] = [];

    if (isAdmin) {
      // Admin can see all tags
      const allTags = await prisma.tag.findMany({
        select: { id: true },
      });
      accessibleTagIds = allTags.map((t) => t.id);
    } else if (userBrandId) {
      // Brand users can only see their brand's tags
      const brandProductIds = await getBrandProductIds(userBrandId);
      const allTags = await prisma.tag.findMany({
        select: { id: true, product_ids: true },
      });

      accessibleTagIds = allTags
        .filter((tag) => {
          const productIds = tag.product_ids as number[];
          return productIds.some((id) => brandProductIds.includes(id));
        })
        .map((t) => t.id);
    }

    if (accessibleTagIds.length === 0) {
      return {
        totalScans: 0,
        scansWithLocation: 0,
        uniqueScanners: 0,
        claimedCount: 0,
        firstHandCount: 0,
        secondHandCount: 0,
        locations: [],
      };
    }

    // Get all scans for accessible tags
    const scans = await prisma.tagScan.findMany({
      where: {
        tag_id: { in: accessibleTagIds },
      },
      include: {
        tag: {
          select: { code: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const uniqueFingerprints = new Set(scans.map((s) => s.fingerprint_id));

    // Filter scans with valid location data
    const locationsWithCoords = scans
      .filter((s) => s.latitude !== null && s.longitude !== null)
      .map((s) => ({
        id: s.id,
        tagId: s.tag_id,
        tagCode: s.tag.code,
        latitude: s.latitude!,
        longitude: s.longitude!,
        locationName: s.location_name,
        isClaimed: s.is_claimed === 1,
        createdAt: s.created_at,
      }));

    return {
      totalScans: scans.length,
      scansWithLocation: locationsWithCoords.length,
      uniqueScanners: uniqueFingerprints.size,
      claimedCount: scans.filter((s) => s.is_claimed === 1).length,
      firstHandCount: scans.filter((s) => s.is_first_hand === 1).length,
      secondHandCount: scans.filter((s) => s.is_first_hand === 0).length,
      locations: locationsWithCoords,
    };
  } catch (error) {
    console.error('Get all tag scan locations error:', error);
    return {
      totalScans: 0,
      scansWithLocation: 0,
      uniqueScanners: 0,
      claimedCount: 0,
      firstHandCount: 0,
      secondHandCount: 0,
      locations: [],
    };
  }
}
