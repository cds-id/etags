'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadFile, deleteFile } from '@/lib/r2';
import type { ProductMetadata } from '@/lib/product-templates';

export type ProductFormState = {
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

// Generate unique product code
function generateProductCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRD-${timestamp}-${random}`;
}

// Get all products with pagination
export async function getProducts(
  page: number = 1,
  limit: number = 10,
  brandId?: number
) {
  await requireAdmin();

  const skip = (page - 1) * limit;
  const where = brandId ? { brand_id: brandId } : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy: { created_at: 'desc' },
      include: {
        brand: {
          select: { id: true, name: true, logo_url: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get all products for select dropdown (no pagination)
export async function getAllProducts(brandId?: number) {
  await requireAdmin();

  const where: { status: number; brand_id?: number } = { status: 1 };
  if (brandId) {
    where.brand_id = brandId;
  }

  return prisma.product.findMany({
    where,
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      code: true,
      metadata: true,
      brand: {
        select: { id: true, name: true },
      },
    },
  });
}

// Get single product by ID
export async function getProductById(id: number) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: {
        select: { id: true, name: true, logo_url: true },
      },
    },
  });

  return product;
}

// Create product
export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();

    const brandId = parseInt(formData.get('brand_id') as string);
    const templateId = formData.get('template_id') as string;
    const status = parseInt(formData.get('status') as string) || 1;

    if (!brandId || !templateId) {
      return { error: 'Brand and template are required' };
    }

    // Parse metadata from form
    const metadataJson = formData.get('metadata') as string;
    let metadata: ProductMetadata;

    try {
      metadata = JSON.parse(metadataJson);
    } catch {
      return { error: 'Invalid product data' };
    }

    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];
    const uploadedImages: string[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return {
            error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed',
          };
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return { error: 'Image size must be less than 5MB' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop() || 'jpg';
        const key = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const result = await uploadFile(key, buffer, file.type);
        uploadedImages.push(result.url);
      }
    }

    // Merge uploaded images with existing ones (if any)
    metadata.images = [...(metadata.images || []), ...uploadedImages];

    const code = generateProductCode();

    await prisma.product.create({
      data: {
        code,
        metadata: metadata as object,
        status,
        brand_id: brandId,
      },
    });

    revalidatePath('/manage/products');
    return { success: true, message: 'Product created successfully' };
  } catch (error) {
    console.error('Create product error:', error);
    return { error: 'Failed to create product' };
  }
}

// Update product
export async function updateProduct(
  id: number,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  try {
    await requireAdmin();

    const brandId = parseInt(formData.get('brand_id') as string);
    const status = parseInt(formData.get('status') as string);

    if (!brandId) {
      return { error: 'Brand is required' };
    }

    // Get existing product for image cleanup
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { metadata: true },
    });

    // Parse metadata from form
    const metadataJson = formData.get('metadata') as string;
    let metadata: ProductMetadata;

    try {
      metadata = JSON.parse(metadataJson);
    } catch {
      return { error: 'Invalid product data' };
    }

    // Handle new image uploads
    const imageFiles = formData.getAll('images') as File[];
    const uploadedImages: string[] = [];

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return {
            error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed',
          };
        }

        if (file.size > 5 * 1024 * 1024) {
          return { error: 'Image size must be less than 5MB' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop() || 'jpg';
        const key = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const result = await uploadFile(key, buffer, file.type);
        uploadedImages.push(result.url);
      }
    }

    // Handle removed images
    const removedImagesJson = formData.get('removed_images') as string;
    const removedImages: string[] = removedImagesJson
      ? JSON.parse(removedImagesJson)
      : [];

    // Delete removed images from R2
    for (const imageUrl of removedImages) {
      const key = imageUrl.split('/').slice(-2).join('/');
      await deleteFile(key);
    }

    // Filter out removed images from existing and add new ones
    const existingMetadata = existingProduct?.metadata as ProductMetadata;
    const existingImages = existingMetadata?.images || [];
    const keptImages = existingImages.filter(
      (img: string) => !removedImages.includes(img)
    );

    metadata.images = [...keptImages, ...uploadedImages];

    await prisma.product.update({
      where: { id },
      data: {
        metadata: metadata as object,
        status,
        brand_id: brandId,
      },
    });

    revalidatePath('/manage/products');
    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    console.error('Update product error:', error);
    return { error: 'Failed to update product' };
  }
}

// Delete product
export async function deleteProduct(id: number): Promise<ProductFormState> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id },
      select: { metadata: true },
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    // Check if product is used in any tags
    const tagsWithProduct = await prisma.tag.findFirst({
      where: {
        product_ids: {
          array_contains: id,
        },
      },
    });

    if (tagsWithProduct) {
      return {
        error: 'Cannot delete product. It is associated with one or more tags.',
      };
    }

    // Delete product images from R2
    const metadata = product.metadata as ProductMetadata;
    if (metadata?.images) {
      for (const imageUrl of metadata.images) {
        const key = imageUrl.split('/').slice(-2).join('/');
        await deleteFile(key);
      }
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/manage/products');
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Delete product error:', error);
    return { error: 'Failed to delete product' };
  }
}

// Toggle product status
export async function toggleProductStatus(
  id: number
): Promise<ProductFormState> {
  try {
    await requireAdmin();

    const product = await prisma.product.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    await prisma.product.update({
      where: { id },
      data: { status: product.status === 1 ? 0 : 1 },
    });

    revalidatePath('/manage/products');
    return { success: true, message: 'Product status updated' };
  } catch (error) {
    console.error('Toggle product status error:', error);
    return { error: 'Failed to update product status' };
  }
}
