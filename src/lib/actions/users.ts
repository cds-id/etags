'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { uploadFile, deleteFile } from '@/lib/r2';

export type UserFormState = {
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

// Get all users with pagination
export async function getUsers(page: number = 1, limit: number = 10) {
  await requireAdmin();

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar_url: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get single user by ID
export async function getUserById(id: number) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar_url: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user;
}

// Create user
export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    await requireAdmin();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const status = parseInt(formData.get('status') as string) || 1;

    if (!name || !email || !password || !role) {
      return { error: 'All fields are required' };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status,
      },
    });

    revalidatePath('/manage/users');
    return { success: true, message: 'User created successfully' };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Failed to create user' };
  }
}

// Update user
export async function updateUser(
  id: number,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    await requireAdmin();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const status = parseInt(formData.get('status') as string);

    if (!name || !email || !role) {
      return { error: 'Name, email, and role are required' };
    }

    // Check if email already exists for another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const updateData: {
      name: string;
      email: string;
      role: string;
      status: number;
      password?: string;
    } = {
      name,
      email,
      role,
      status,
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/manage/users');
    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    console.error('Update user error:', error);
    return { error: 'Failed to update user' };
  }
}

// Delete user
export async function deleteUser(id: number): Promise<UserFormState> {
  try {
    const session = await requireAdmin();

    // Prevent self-deletion
    if (parseInt(session.user.id) === id) {
      return { error: 'Cannot delete your own account' };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { avatar_url: true },
    });

    // Delete avatar from R2 if exists
    if (user?.avatar_url) {
      const key = user.avatar_url.split('/').pop();
      if (key) {
        await deleteFile(`avatars/${key}`);
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/manage/users');
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: 'Failed to delete user' };
  }
}

// Upload user avatar
export async function uploadUserAvatar(
  userId: number,
  formData: FormData
): Promise<UserFormState> {
  try {
    await requireAdmin();

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    // Delete old avatar if exists
    if (user?.avatar_url) {
      const oldKey = user.avatar_url.split('/').pop();
      if (oldKey) {
        await deleteFile(`avatars/${oldKey}`);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const key = `avatars/user-${userId}-${Date.now()}.${ext}`;

    const result = await uploadFile(key, buffer, file.type);

    await prisma.user.update({
      where: { id: userId },
      data: { avatar_url: result.url },
    });

    revalidatePath('/manage/users');
    return { success: true, message: 'Avatar uploaded successfully' };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { error: 'Failed to upload avatar' };
  }
}

// Toggle user status
export async function toggleUserStatus(id: number): Promise<UserFormState> {
  try {
    const session = await requireAdmin();

    // Prevent self-deactivation
    if (parseInt(session.user.id) === id) {
      return { error: 'Cannot change your own status' };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    await prisma.user.update({
      where: { id },
      data: { status: user.status === 1 ? 0 : 1 },
    });

    revalidatePath('/manage/users');
    return { success: true, message: 'User status updated' };
  } catch (error) {
    console.error('Toggle user status error:', error);
    return { error: 'Failed to update user status' };
  }
}
