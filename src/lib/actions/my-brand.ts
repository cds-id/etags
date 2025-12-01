'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadFile, deleteFile } from '@/lib/r2';

export type MyBrandFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// Helper to get user's brand
async function getUserBrand() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  if (session.user.role !== 'brand') {
    throw new Error('Unauthorized: Brand user access required');
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    include: { brand: true },
  });

  if (!user?.brand) {
    throw new Error('Brand not found');
  }

  return { user, brand: user.brand };
}

// Get current user's brand
export async function getMyBrand() {
  const { brand } = await getUserBrand();
  return brand;
}

// Update brand info (name and description)
export async function updateMyBrand(
  _prevState: MyBrandFormState,
  formData: FormData
): Promise<MyBrandFormState> {
  try {
    const { brand } = await getUserBrand();

    const name = formData.get('name') as string;
    const descriptions = formData.get('descriptions') as string;

    if (!name || !descriptions) {
      return { error: 'Nama dan deskripsi wajib diisi' };
    }

    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        name,
        descriptions,
      },
    });

    revalidatePath('/manage/my-brand');
    revalidatePath('/manage');
    return { success: true, message: 'Brand berhasil diperbarui' };
  } catch (error) {
    console.error('Update brand error:', error);
    return { error: 'Gagal memperbarui brand' };
  }
}

// Upload brand logo
export async function uploadMyBrandLogo(
  _prevState: MyBrandFormState,
  formData: FormData
): Promise<MyBrandFormState> {
  try {
    const { brand } = await getUserBrand();

    const logoFile = formData.get('logo') as File;

    if (!logoFile || logoFile.size === 0) {
      return { error: 'Pilih file logo untuk diunggah' };
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(logoFile.type)) {
      return {
        error:
          'Format file tidak valid. Hanya JPEG, PNG, WebP, dan SVG yang diizinkan',
      };
    }

    // Validate file size (max 5MB)
    if (logoFile.size > 5 * 1024 * 1024) {
      return { error: 'Ukuran file harus kurang dari 5MB' };
    }

    // Delete old logo if exists
    if (brand.logo_url) {
      const oldKey = brand.logo_url.split('/').slice(-2).join('/');
      await deleteFile(oldKey);
    }

    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const ext = logoFile.name.split('.').pop() || 'png';
    const key = `brands/brand-${brand.id}-${Date.now()}.${ext}`;

    const result = await uploadFile(key, buffer, logoFile.type);

    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        logo_url: result.url,
      },
    });

    revalidatePath('/manage/my-brand');
    revalidatePath('/manage');
    return { success: true, message: 'Logo berhasil diunggah' };
  } catch (error) {
    console.error('Upload brand logo error:', error);
    return { error: 'Gagal mengunggah logo' };
  }
}

// Remove brand logo
export async function removeMyBrandLogo(): Promise<MyBrandFormState> {
  try {
    const { brand } = await getUserBrand();

    if (!brand.logo_url) {
      return { error: 'Tidak ada logo untuk dihapus' };
    }

    // Delete from R2
    const key = brand.logo_url.split('/').slice(-2).join('/');
    await deleteFile(key);

    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        logo_url: null,
      },
    });

    revalidatePath('/manage/my-brand');
    revalidatePath('/manage');
    return { success: true, message: 'Logo berhasil dihapus' };
  } catch (error) {
    console.error('Remove brand logo error:', error);
    return { error: 'Gagal menghapus logo' };
  }
}
