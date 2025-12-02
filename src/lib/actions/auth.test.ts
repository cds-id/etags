import { describe, it, expect, beforeEach } from 'vitest';
import { login, register } from './auth';
import { AuthError } from 'next-auth';
import {
  mockPrismaClient,
  mockSignIn,
  mockBcrypt,
  createMockFormData,
  resetAllMocks,
} from '@/tests/mocks';

describe('auth actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('login', () => {
    it('should return success when credentials are valid', async () => {
      mockSignIn.mockResolvedValue(undefined);

      const formData = createMockFormData({
        email: 'admin@example.com',
        password: 'password123',
      });

      const result = await login({}, formData);

      expect(result).toEqual({ success: true });
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@example.com',
        password: 'password123',
        redirectTo: '/manage',
      });
    });

    it('should return error when credentials are invalid', async () => {
      const authError = new AuthError('CredentialsSignin');
      mockSignIn.mockRejectedValue(authError);

      const formData = createMockFormData({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      const result = await login({}, formData);

      expect(result).toEqual({ error: 'Invalid email or password' });
    });

    it('should return generic error for other auth errors', async () => {
      const authError = new AuthError('Configuration');
      mockSignIn.mockRejectedValue(authError);

      const formData = createMockFormData({
        email: 'test@example.com',
        password: 'password',
      });

      const result = await login({}, formData);

      expect(result).toEqual({ error: 'Something went wrong' });
    });

    it('should rethrow non-auth errors', async () => {
      const error = new Error('Network error');
      mockSignIn.mockRejectedValue(error);

      const formData = createMockFormData({
        email: 'test@example.com',
        password: 'password',
      });

      await expect(login({}, formData)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should return error if required fields are missing', async () => {
      const formData = createMockFormData({
        name: '',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Semua field wajib diisi' });
    });

    it('should return error if name is too short', async () => {
      const formData = createMockFormData({
        name: 'A',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Nama harus minimal 2 karakter' });
    });

    it('should return error if email format is invalid', async () => {
      const formData = createMockFormData({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Format email tidak valid' });
    });

    it('should return error if password is too short', async () => {
      const formData = createMockFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: '12345',
        confirmPassword: '12345',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Password harus minimal 6 karakter' });
    });

    it('should return error if passwords do not match', async () => {
      const formData = createMockFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Password tidak cocok' });
    });

    it('should return error if email already exists', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      const formData = createMockFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Email sudah terdaftar' });
    });

    it('should successfully register a new user', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword');
      mockPrismaClient.user.create.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      });
      mockSignIn.mockResolvedValue(undefined);

      const formData = createMockFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ success: true });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword',
          role: 'brand',
          status: 1,
          onboarding_complete: 0,
        },
      });
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirectTo: '/manage/onboarding',
      });
    });

    it('should rethrow NEXT_REDIRECT errors', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword');
      mockPrismaClient.user.create.mockResolvedValue({ id: 1 });

      const redirectError = new Error('NEXT_REDIRECT');
      mockSignIn.mockRejectedValue(redirectError);

      const formData = createMockFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      await expect(register({}, formData)).rejects.toThrow('NEXT_REDIRECT');
    });

    it('should return error for database failures', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword');
      mockPrismaClient.user.create.mockRejectedValue(new Error('DB Error'));

      const formData = createMockFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = await register({}, formData);

      expect(result).toEqual({ error: 'Gagal mendaftar. Silakan coba lagi.' });
    });
  });
});
