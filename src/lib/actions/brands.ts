'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadFile, deleteFile } from '@/lib/r2';

export type BrandFormState = {
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

// Get all brands with pagination
export async function getBrands(page: number = 1, limit: number = 10) {
  await requireAdmin();

  const skip = (page - 1) * limit;
  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.brand.count(),
  ]);

  return {
    brands,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get all brands for select dropdown (no pagination)
export async function getAllBrands() {
  await requireAdmin();

  return prisma.brand.findMany({
    where: { status: 1 },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
    },
  });
}

// Get single brand by ID
export async function getBrandById(id: number) {
  await requireAdmin();

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return brand;
}

// Create brand
export async function createBrand(
  _prevState: BrandFormState,
  formData: FormData
): Promise<BrandFormState> {
  try {
    await requireAdmin();

    const name = formData.get('name') as string;
    const descriptions = formData.get('descriptions') as string;
    const status = parseInt(formData.get('status') as string) || 1;
    const logoFile = formData.get('logo') as File;

    if (!name || !descriptions) {
      return { error: 'Name and description are required' };
    }

    let logoUrl: string | null = null;

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
      ];
      if (!allowedTypes.includes(logoFile.type)) {
        return {
          error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed',
        };
      }

      // Validate file size (max 5MB)
      if (logoFile.size > 5 * 1024 * 1024) {
        return { error: 'File size must be less than 5MB' };
      }

      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `brands/brand-${Date.now()}.${ext}`;

      const result = await uploadFile(key, buffer, logoFile.type);
      logoUrl = result.url;
    }

    await prisma.brand.create({
      data: {
        name,
        descriptions,
        status,
        logo_url: logoUrl,
      },
    });

    revalidatePath('/manage/brands');
    return { success: true, message: 'Brand created successfully' };
  } catch (error) {
    console.error('Create brand error:', error);
    return { error: 'Failed to create brand' };
  }
}

// Update brand
export async function updateBrand(
  id: number,
  _prevState: BrandFormState,
  formData: FormData
): Promise<BrandFormState> {
  try {
    await requireAdmin();

    const name = formData.get('name') as string;
    const descriptions = formData.get('descriptions') as string;
    const status = parseInt(formData.get('status') as string);
    const logoFile = formData.get('logo') as File;
    const removeLogo = formData.get('removeLogo') === 'true';

    if (!name || !descriptions) {
      return { error: 'Name and description are required' };
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      select: { logo_url: true },
    });

    let logoUrl = existingBrand?.logo_url || null;

    // Handle logo removal
    if (removeLogo && logoUrl) {
      const oldKey = logoUrl.split('/').slice(-2).join('/');
      await deleteFile(oldKey);
      logoUrl = null;
    }

    // Upload new logo if provided
    if (logoFile && logoFile.size > 0) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
      ];
      if (!allowedTypes.includes(logoFile.type)) {
        return {
          error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed',
        };
      }

      // Validate file size (max 5MB)
      if (logoFile.size > 5 * 1024 * 1024) {
        return { error: 'File size must be less than 5MB' };
      }

      // Delete old logo if exists
      if (existingBrand?.logo_url) {
        const oldKey = existingBrand.logo_url.split('/').slice(-2).join('/');
        await deleteFile(oldKey);
      }

      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `brands/brand-${id}-${Date.now()}.${ext}`;

      const result = await uploadFile(key, buffer, logoFile.type);
      logoUrl = result.url;
    }

    await prisma.brand.update({
      where: { id },
      data: {
        name,
        descriptions,
        status,
        logo_url: logoUrl,
      },
    });

    revalidatePath('/manage/brands');
    return { success: true, message: 'Brand updated successfully' };
  } catch (error) {
    console.error('Update brand error:', error);
    return { error: 'Failed to update brand' };
  }
}

// Delete brand
export async function deleteBrand(id: number): Promise<BrandFormState> {
  try {
    await requireAdmin();

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: {
        logo_url: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      return { error: 'Brand not found' };
    }

    // Check if brand has products
    if (brand._count.products > 0) {
      return {
        error:
          'Cannot delete brand with existing products. Delete products first.',
      };
    }

    // Delete logo from R2 if exists
    if (brand.logo_url) {
      const key = brand.logo_url.split('/').slice(-2).join('/');
      await deleteFile(key);
    }

    await prisma.brand.delete({
      where: { id },
    });

    revalidatePath('/manage/brands');
    return { success: true, message: 'Brand deleted successfully' };
  } catch (error) {
    console.error('Delete brand error:', error);
    return { error: 'Failed to delete brand' };
  }
}

// Get brand stats
export async function getBrandStats() {
  await requireAdmin();

  const [totalBrands, activeBrands, totalProducts, brandsWithProducts] =
    await Promise.all([
      prisma.brand.count(),
      prisma.brand.count({ where: { status: 1 } }),
      prisma.product.count(),
      prisma.brand.count({
        where: {
          products: {
            some: {},
          },
        },
      }),
    ]);

  return {
    totalBrands,
    activeBrands,
    inactiveBrands: totalBrands - activeBrands,
    totalProducts,
    brandsWithProducts,
    brandsWithoutProducts: totalBrands - brandsWithProducts,
  };
}

// Toggle brand status
export async function toggleBrandStatus(id: number): Promise<BrandFormState> {
  try {
    await requireAdmin();

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!brand) {
      return { error: 'Brand not found' };
    }

    await prisma.brand.update({
      where: { id },
      data: { status: brand.status === 1 ? 0 : 1 },
    });

    revalidatePath('/manage/brands');
    return { success: true, message: 'Brand status updated' };
  } catch (error) {
    console.error('Toggle brand status error:', error);
    return { error: 'Failed to update brand status' };
  }
}
