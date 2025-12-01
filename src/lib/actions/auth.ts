'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export type LoginState = {
  error?: string;
  success?: boolean;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: '/manage',
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Something went wrong' };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // Validation
  if (!name || !email || !password) {
    return { error: 'Semua field wajib diisi' };
  }

  if (name.length < 2) {
    return { error: 'Nama harus minimal 2 karakter' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Format email tidak valid' };
  }

  if (password.length < 6) {
    return { error: 'Password harus minimal 6 karakter' };
  }

  if (password !== confirmPassword) {
    return { error: 'Password tidak cocok' };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email sudah terdaftar' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with brand role
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'brand',
        status: 1,
        onboarding_complete: 0,
      },
    });

    // Auto login after registration
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/manage/onboarding',
    });

    return { success: true };
  } catch (error) {
    // signIn throws NEXT_REDIRECT on success, we need to re-throw it
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    if (
      error instanceof Error &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
    console.error('Registration error:', error);
    return { error: 'Gagal mendaftar. Silakan coba lagi.' };
  }
}
