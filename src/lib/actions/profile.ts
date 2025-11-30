'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { uploadFile, deleteFile } from '@/lib/r2';

export type ProfileFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// Helper to get current user
async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

// Get current user profile
export async function getProfile() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar_url: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user;
}

// Update profile info (name, email)
export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name || !email) {
      return { error: 'Name and email are required' };
    }

    // Check if email already exists for another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return { error: 'Email already in use by another account' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name, email },
    });

    revalidatePath('/manage/profile');
    revalidatePath('/manage', 'layout');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Failed to update profile' };
  }
}

// Update password
export async function updatePassword(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: 'All password fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return { error: 'Current password is incorrect' };
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    revalidatePath('/manage/profile');
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: 'Failed to update password' };
  }
}

// Upload avatar
export async function uploadAvatar(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    const file = formData.get('avatar') as File;
    if (!file || file.size === 0) {
      return { error: 'No file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size must be less than 5MB' };
    }

    // Get current avatar to delete
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    // Delete old avatar if exists
    if (user?.avatar_url) {
      const oldKey = user.avatar_url.split('/').slice(-2).join('/');
      await deleteFile(oldKey);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `avatars/user-${userId}-${Date.now()}.${ext}`;

    const result = await uploadFile(key, buffer, file.type);

    await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: result.url },
    });

    revalidatePath('/manage/profile');
    revalidatePath('/manage', 'layout');
    return { success: true, message: 'Avatar uploaded successfully' };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { error: 'Failed to upload avatar' };
  }
}

// Remove avatar
export async function removeAvatar(): Promise<ProfileFormState> {
  try {
    const session = await requireAuth();
    const userId = parseInt(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    if (user?.avatar_url) {
      const key = user.avatar_url.split('/').slice(-2).join('/');
      await deleteFile(key);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: null },
    });

    revalidatePath('/manage/profile');
    revalidatePath('/manage', 'layout');
    return { success: true, message: 'Avatar removed successfully' };
  } catch (error) {
    console.error('Remove avatar error:', error);
    return { error: 'Failed to remove avatar' };
  }
}
