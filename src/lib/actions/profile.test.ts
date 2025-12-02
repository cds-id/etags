import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  removeAvatar,
} from './profile';
import {
  mockPrismaClient,
  mockAuth,
  mockDeleteFile,
  mockBcrypt,
  mockRevalidatePath,
  createMockSession,
  createMockFormData,
  createMockFile,
  resetAllMocks,
} from '@/tests/mocks';

describe('profile actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getProfile', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getProfile()).rejects.toThrow('Unauthorized');
    });

    it('should return current user profile', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await getProfile();

      expect(result).toEqual(mockUser);
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });
  });

  describe('updateProfile', () => {
    it('should return error if name is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        name: '',
        email: 'test@example.com',
      });

      const result = await updateProfile({}, formData);

      expect(result).toEqual({ error: 'Name and email are required' });
    });

    it('should return error if email is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        name: 'Test User',
        email: '',
      });

      const result = await updateProfile({}, formData);

      expect(result).toEqual({ error: 'Name and email are required' });
    });

    it('should return error if email is taken by another user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findFirst.mockResolvedValue({
        id: 2,
        email: 'taken@example.com',
      });

      const formData = createMockFormData({
        name: 'Test User',
        email: 'taken@example.com',
      });

      const result = await updateProfile({}, formData);

      expect(result).toEqual({
        error: 'Email already in use by another account',
      });
    });

    it('should update profile successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        name: 'Updated Name',
        email: 'updated@example.com',
      });

      const result = await updateProfile({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Profile updated successfully',
      });
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Name', email: 'updated@example.com' },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/profile');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage', 'layout');
    });

    it('should handle database errors during profile update', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockPrismaClient.user.update.mockRejectedValue(new Error('DB Error'));

      const formData = createMockFormData({
        name: 'Updated Name',
        email: 'updated@example.com',
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await updateProfile({}, formData);

      expect(result).toEqual({ error: 'Failed to update profile' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Update profile error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updatePassword', () => {
    it('should return error if any password field is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        currentPassword: 'current123',
        newPassword: '',
        confirmPassword: 'new123',
      });

      const result = await updatePassword({}, formData);

      expect(result).toEqual({ error: 'All password fields are required' });
    });

    it('should return error if new passwords do not match', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        currentPassword: 'current123',
        newPassword: 'new123',
        confirmPassword: 'different123',
      });

      const result = await updatePassword({}, formData);

      expect(result).toEqual({ error: 'New passwords do not match' });
    });

    it('should return error if new password is too short', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        currentPassword: 'current123',
        newPassword: '12345',
        confirmPassword: '12345',
      });

      const result = await updatePassword({}, formData);

      expect(result).toEqual({
        error: 'Password must be at least 6 characters',
      });
    });

    it('should return error if user not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const formData = createMockFormData({
        currentPassword: 'current123',
        newPassword: 'new123456',
        confirmPassword: 'new123456',
      });

      const result = await updatePassword({}, formData);

      expect(result).toEqual({ error: 'User not found' });
    });

    it('should return error if current password is incorrect', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        password: 'hashedPassword',
      });
      mockBcrypt.compare.mockResolvedValue(false);

      const formData = createMockFormData({
        currentPassword: 'wrong123',
        newPassword: 'new123456',
        confirmPassword: 'new123456',
      });

      const result = await updatePassword({}, formData);

      expect(result).toEqual({ error: 'Current password is incorrect' });
    });

    it('should update password successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        password: 'hashedPassword',
      });
      mockBcrypt.compare.mockResolvedValue(true);
      mockBcrypt.hash.mockResolvedValue('newHashedPassword');
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        currentPassword: 'current123',
        newPassword: 'new123456',
        confirmPassword: 'new123456',
      });

      const result = await updatePassword({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Password updated successfully',
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('new123456', 10);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'newHashedPassword' },
      });
    });
  });

  describe('uploadAvatar', () => {
    it('should return error if no file provided', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = new FormData();

      const result = await uploadAvatar({}, formData);

      expect(result).toEqual({ error: 'No file provided' });
    });

    it('should return error for invalid file type', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = new FormData();
      formData.append(
        'avatar',
        createMockFile('doc', 'file.pdf', 'application/pdf')
      );

      const result = await uploadAvatar({}, formData);

      expect(result).toEqual({
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      });
    });

    it('should return error for file larger than 5MB', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const largeContent = 'x'.repeat(6 * 1024 * 1024);
      const formData = new FormData();
      formData.append(
        'avatar',
        createMockFile(largeContent, 'large.jpg', 'image/jpeg')
      );

      const result = await uploadAvatar({}, formData);

      expect(result).toEqual({ error: 'File size must be less than 5MB' });
    });

    it('should handle database errors during upload', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        avatar_url: null,
      });
      mockPrismaClient.user.update.mockRejectedValue(new Error('DB Error'));

      const formData = new FormData();
      formData.append(
        'avatar',
        createMockFile('image data', 'avatar.jpg', 'image/jpeg')
      );

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await uploadAvatar({}, formData);

      expect(result).toEqual({ error: 'Failed to upload avatar' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Upload avatar error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()
    // These would be better tested with integration/e2e tests
  });

  describe('removeAvatar', () => {
    it('should remove avatar and update database', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        avatar_url: 'https://r2.example.com/avatars/current.jpg',
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const result = await removeAvatar();

      expect(result).toEqual({
        success: true,
        message: 'Avatar removed successfully',
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('avatars/current.jpg');
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { avatar_url: null },
      });
    });

    it('should handle user without avatar', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        avatar_url: null,
      });
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const result = await removeAvatar();

      expect(result).toEqual({
        success: true,
        message: 'Avatar removed successfully',
      });
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    it('should handle database errors during removal', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        avatar_url: 'https://r2.example.com/avatars/current.jpg',
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.user.update.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await removeAvatar();

      expect(result).toEqual({ error: 'Failed to remove avatar' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Remove avatar error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
