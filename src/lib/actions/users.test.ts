import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadUserAvatar,
  toggleUserStatus,
} from './users';
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

describe('users actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getUsers', () => {
    it('should throw error if user is not admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));

      await expect(getUsers()).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should return paginated users for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockUsers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', role: 'admin' },
        { id: 2, name: 'User 2', email: 'user2@example.com', role: 'brand' },
      ];
      mockPrismaClient.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaClient.user.count.mockResolvedValue(2);

      const result = await getUsers(1, 10);

      expect(result.users).toEqual(mockUsers);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should handle pagination correctly', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findMany.mockResolvedValue([]);
      mockPrismaClient.user.count.mockResolvedValue(30);

      const result = await getUsers(2, 10);

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 30,
        totalPages: 3,
      });
      expect(mockPrismaClient.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'brand',
      };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserById(1);

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should return error if required fields are missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        name: 'Test User',
        email: '',
        password: 'password123',
        role: 'brand',
        status: '1',
      });

      const result = await createUser({}, formData);

      expect(result).toEqual({ error: 'All fields are required' });
    });

    it('should return error if email already exists', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      const formData = createMockFormData({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'brand',
        status: '1',
      });

      const result = await createUser({}, formData);

      expect(result).toEqual({ error: 'Email already exists' });
    });

    it('should create user successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword');
      mockPrismaClient.user.create.mockResolvedValue({
        id: 1,
        name: 'New User',
      });

      const formData = createMockFormData({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'brand',
        status: '1',
      });

      const result = await createUser({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'User created successfully',
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          name: 'New User',
          email: 'new@example.com',
          password: 'hashedPassword',
          role: 'brand',
          status: 1,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/users');
    });
  });

  describe('updateUser', () => {
    it('should return error if required fields are missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        name: 'Updated User',
        email: '',
        password: '',
        role: 'brand',
        status: '1',
      });

      const result = await updateUser(1, {}, formData);

      expect(result).toEqual({ error: 'Name, email, and role are required' });
    });

    it('should return error if email is taken by another user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findFirst.mockResolvedValue({
        id: 2,
        email: 'taken@example.com',
      });

      const formData = createMockFormData({
        name: 'Updated User',
        email: 'taken@example.com',
        password: '',
        role: 'brand',
        status: '1',
      });

      const result = await updateUser(1, {}, formData);

      expect(result).toEqual({ error: 'Email already exists' });
    });

    it('should update user without changing password', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        name: 'Updated User',
        email: 'updated@example.com',
        password: '',
        role: 'admin',
        status: '1',
      });

      const result = await updateUser(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'User updated successfully',
      });
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated User',
          email: 'updated@example.com',
          role: 'admin',
          status: 1,
        },
      });
    });

    it('should update user with new password', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('newHashedPassword');
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        name: 'Updated User',
        email: 'updated@example.com',
        password: 'newPassword123',
        role: 'admin',
        status: '1',
      });

      const result = await updateUser(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'User updated successfully',
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          password: 'newHashedPassword',
        }),
      });
    });
  });

  describe('deleteUser', () => {
    it('should prevent self-deletion', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));

      const result = await deleteUser(1);

      expect(result).toEqual({ error: 'Cannot delete your own account' });
    });

    it('should delete user and avatar successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        avatar_url: 'https://r2.example.com/avatars/user-2-123.jpg',
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.user.delete.mockResolvedValue({ id: 2 });

      const result = await deleteUser(2);

      expect(result).toEqual({
        success: true,
        message: 'User deleted successfully',
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('avatars/user-2-123.jpg');
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('should delete user without avatar', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        avatar_url: null,
      });
      mockPrismaClient.user.delete.mockResolvedValue({ id: 2 });

      const result = await deleteUser(2);

      expect(result).toEqual({
        success: true,
        message: 'User deleted successfully',
      });
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });
  });

  describe('uploadUserAvatar', () => {
    it('should return error if no file provided', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = new FormData();

      const result = await uploadUserAvatar(1, formData);

      expect(result).toEqual({ error: 'No file provided' });
    });

    it('should return error for invalid file type', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = new FormData();
      formData.append(
        'avatar',
        createMockFile('doc', 'file.pdf', 'application/pdf')
      );

      const result = await uploadUserAvatar(1, formData);

      expect(result).toEqual({
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      });
    });

    it('should return error for file larger than 5MB', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const largeContent = 'x'.repeat(6 * 1024 * 1024);
      const formData = new FormData();
      formData.append(
        'avatar',
        createMockFile(largeContent, 'large.jpg', 'image/jpeg')
      );

      const result = await uploadUserAvatar(1, formData);

      expect(result).toEqual({ error: 'File size must be less than 5MB' });
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()
    // These would be better tested with integration/e2e tests
  });

  describe('toggleUserStatus', () => {
    it('should prevent self-deactivation', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));

      const result = await toggleUserStatus(1);

      expect(result).toEqual({ error: 'Cannot change your own status' });
    });

    it('should return error if user not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await toggleUserStatus(999);

      expect(result).toEqual({ error: 'User not found' });
    });

    it('should toggle status from 1 to 0', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 2,
        status: 1,
      });
      mockPrismaClient.user.update.mockResolvedValue({ id: 2, status: 0 });

      const result = await toggleUserStatus(2);

      expect(result).toEqual({
        success: true,
        message: 'User status updated',
      });
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: 0 },
      });
    });

    it('should toggle status from 0 to 1', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1', role: 'admin' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 2,
        status: 0,
      });
      mockPrismaClient.user.update.mockResolvedValue({ id: 2, status: 1 });

      const result = await toggleUserStatus(2);

      expect(result).toEqual({
        success: true,
        message: 'User status updated',
      });
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { status: 1 },
      });
    });
  });
});
