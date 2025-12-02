'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/r2';

export type OnboardingState = {
  error?: string;
  success?: boolean;
  message?: string;
  brandId?: number;
  productId?: number;
  tagId?: number;
};

// Helper to get current user session
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Get onboarding status for current user
export async function getOnboardingStatus() {
  const session = await requireAuth();
  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      brand: {
        include: {
          products: {
            take: 1,
            orderBy: { created_at: 'desc' },
          },
        },
      },
    },
  });

  if (!user) {
    return { step: 0, complete: false };
  }

  // Determine current step
  // Step 1: Brand setup
  // Step 2: Product setup
  // Step 3: Tag setup
  // Step 4: Complete

  if (!user.brand_id) {
    return {
      step: 1,
      complete: false,
      hasBrand: false,
      hasProduct: false,
      hasTag: false,
    };
  }

  const productCount = user.brand?.products?.length || 0;
  if (productCount === 0) {
    return {
      step: 2,
      complete: false,
      hasBrand: true,
      hasProduct: false,
      hasTag: false,
      brandId: user.brand_id,
      brandName: user.brand?.name,
    };
  }

  // Check if there's at least one tag with products from this brand
  const tag = await prisma.tag.findFirst({
    where: {
      product_ids: {
        not: '[]',
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // Check if the tag contains products from user's brand
  let hasTagForBrand = false;
  if (tag && user.brand?.products) {
    const productIds = user.brand.products.map((p) => p.id);
    const tagProductIds = tag.product_ids as number[];
    hasTagForBrand = tagProductIds.some((id) => productIds.includes(id));
  }

  if (!hasTagForBrand) {
    return {
      step: 3,
      complete: false,
      hasBrand: true,
      hasProduct: true,
      hasTag: false,
      brandId: user.brand_id,
      brandName: user.brand?.name,
      productId: user.brand?.products?.[0]?.id,
    };
  }

  return {
    step: 4,
    complete: true,
    hasBrand: true,
    hasProduct: true,
    hasTag: true,
    brandId: user.brand_id,
    brandName: user.brand?.name,
  };
}

// Step 1: Create brand for onboarding user
export async function createOnboardingBrand(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    const name = formData.get('name') as string;
    const descriptions = formData.get('descriptions') as string;
    const logoFile = formData.get('logo') as File;

    if (!name || !descriptions) {
      return { error: 'Nama dan deskripsi brand wajib diisi' };
    }

    let logoUrl: string | null = null;

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
      ];
      if (!allowedTypes.includes(logoFile.type)) {
        return {
          error:
            'Format file tidak valid. Hanya JPEG, PNG, WebP, dan SVG yang diperbolehkan',
        };
      }

      if (logoFile.size > 5 * 1024 * 1024) {
        return { error: 'Ukuran file maksimal 5MB' };
      }

      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const ext = logoFile.name.split('.').pop() || 'png';
      const key = `brands/brand-${Date.now()}.${ext}`;

      const result = await uploadFile(key, buffer, logoFile.type);
      logoUrl = result.url;
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name,
        descriptions,
        status: 1,
        logo_url: logoUrl,
      },
    });

    // Link brand to user
    await prisma.user.update({
      where: { id: userId },
      data: { brand_id: brand.id },
    });

    revalidatePath('/manage/onboarding');
    return {
      success: true,
      message: 'Brand berhasil dibuat',
      brandId: brand.id,
    };
  } catch (error) {
    console.error('Create onboarding brand error:', error);
    return { error: 'Gagal membuat brand' };
  }
}

// Step 2: Create product for onboarding user
export async function createOnboardingProduct(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    // Get user's brand
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { brand_id: true },
    });

    if (!user?.brand_id) {
      return { error: 'Anda harus membuat brand terlebih dahulu' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = formData.get('price') as string;
    const sku = formData.get('sku') as string;
    const imageFile = formData.get('image') as File;

    if (!name || !description) {
      return { error: 'Nama dan deskripsi produk wajib diisi' };
    }

    let images: string[] = [];

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        return {
          error:
            'Format file tidak valid. Hanya JPEG, PNG, dan WebP yang diperbolehkan',
        };
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return { error: 'Ukuran file maksimal 5MB' };
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const key = `products/product-${Date.now()}.${ext}`;

      const result = await uploadFile(key, buffer, imageFile.type);
      images = [result.url];
    }

    // Generate product code
    const code = `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create product
    const product = await prisma.product.create({
      data: {
        code,
        brand_id: user.brand_id,
        status: 1,
        metadata: {
          name,
          description,
          category: category || 'Umum',
          price: price ? parseFloat(price) : null,
          sku: sku || null,
          images,
        },
      },
    });

    revalidatePath('/manage/onboarding');
    return {
      success: true,
      message: 'Produk berhasil dibuat',
      productId: product.id,
    };
  } catch (error) {
    console.error('Create onboarding product error:', error);
    return { error: 'Gagal membuat produk' };
  }
}

// Step 3: Create tag for onboarding user
export async function createOnboardingTag(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    // Get user's brand and products
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brand: {
          include: {
            products: {
              where: { status: 1 },
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
    });

    if (!user?.brand_id) {
      return { error: 'Anda harus membuat brand terlebih dahulu' };
    }

    if (!user.brand?.products || user.brand.products.length === 0) {
      return { error: 'Anda harus membuat produk terlebih dahulu' };
    }

    const productIdStr = formData.get('productId') as string;
    const distributorName = formData.get('distributorName') as string;
    const distributorLocation = formData.get('distributorLocation') as string;
    const batchNumber = formData.get('batchNumber') as string;
    const notes = formData.get('notes') as string;

    if (!productIdStr) {
      return { error: 'Pilih produk untuk tag' };
    }

    const productId = parseInt(productIdStr);

    // Verify product belongs to user's brand
    const validProduct = user.brand.products.find((p) => p.id === productId);
    if (!validProduct) {
      return { error: 'Produk tidak valid' };
    }

    // Generate tag code
    const code = `TAG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create tag with metadata keys matching the tag form
    const tag = await prisma.tag.create({
      data: {
        code,
        product_ids: [productId],
        metadata: {
          // Use the same field names as tag-form-page.tsx
          distribution_region: distributorLocation || null,
          batch_number: batchNumber || null,
          notes: notes || null,
          // Store distributor name in a custom field for reference
          distributor_name: distributorName || null,
          createdBy: session.user.name,
        },
        is_stamped: 0,
        publish_status: 0,
      },
    });

    revalidatePath('/manage/onboarding');
    return { success: true, message: 'Tag berhasil dibuat', tagId: tag.id };
  } catch (error) {
    console.error('Create onboarding tag error:', error);
    return { error: 'Gagal membuat tag' };
  }
}

// Complete onboarding
export async function completeOnboarding(): Promise<void> {
  const session = await requireAuth();
  const userId = parseInt(session.user.id);

  await prisma.user.update({
    where: { id: userId },
    data: { onboarding_complete: 1 },
  });

  revalidatePath('/manage');
  // redirect('/manage'); // Removed to allow client-side session update first
}

// Get user's brand products for tag creation
export async function getOnboardingProducts() {
  const session = await requireAuth();
  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      brand: {
        include: {
          products: {
            where: { status: 1 },
            orderBy: { created_at: 'desc' },
          },
        },
      },
    },
  });

  if (!user?.brand?.products) {
    return [];
  }

  return user.brand.products.map((p) => ({
    id: p.id,
    code: p.code,
    name: (p.metadata as { name?: string })?.name || 'Produk Tanpa Nama',
  }));
}
