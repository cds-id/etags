import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMyBrand,
  updateMyBrand,
  uploadMyBrandLogo,
  removeMyBrandLogo,
} from './my-brand';
import {
  mockPrismaClient,
  mockAuth,
  mockDeleteFile,
  mockRevalidatePath,
  createMockSession,
  createMockFormData,
  createMockFile,
  resetAllMocks,
} from '@/tests/mocks';

describe('my-brand actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getMyBrand', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getMyBrand()).rejects.toThrow('Unauthorized');
    });

    it('should throw error if user is not a brand user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      await expect(getMyBrand()).rejects.toThrow(
        'Unauthorized: Brand user access required'
      );
    });

    it('should throw error if user has no brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: null,
      });

      await expect(getMyBrand()).rejects.toThrow('Brand not found');
    });

    it('should return user brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      const mockBrand = {
        id: 1,
        name: 'My Brand',
        descriptions: 'Description',
        logo_url: null,
      };
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: mockBrand,
      });

      const result = await getMyBrand();

      expect(result).toEqual(mockBrand);
    });
  });

  describe('updateMyBrand', () => {
    it('should return error if name is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 1, name: 'Brand' },
      });

      const formData = createMockFormData({
        name: '',
        descriptions: 'Description',
      });

      const result = await updateMyBrand({}, formData);

      expect(result).toEqual({ error: 'Nama dan deskripsi wajib diisi' });
    });

    it('should return error if descriptions is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 1, name: 'Brand' },
      });

      const formData = createMockFormData({
        name: 'Brand Name',
        descriptions: '',
      });

      const result = await updateMyBrand({}, formData);

      expect(result).toEqual({ error: 'Nama dan deskripsi wajib diisi' });
    });

    it('should update brand successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, name: 'Old Name' },
      });
      mockPrismaClient.brand.update.mockResolvedValue({ id: 5 });

      const formData = createMockFormData({
        name: 'Updated Brand',
        descriptions: 'Updated description',
      });

      const result = await updateMyBrand({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Brand berhasil diperbarui',
      });
      expect(mockPrismaClient.brand.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          name: 'Updated Brand',
          descriptions: 'Updated description',
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/my-brand');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, name: 'Test Brand' },
      });
      mockPrismaClient.brand.update.mockRejectedValue(new Error('DB Error'));

      const formData = createMockFormData({
        name: 'Updated Brand',
        descriptions: 'Updated description',
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await updateMyBrand({}, formData);

      expect(result).toEqual({ error: 'Gagal memperbarui brand' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Update brand error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('uploadMyBrandLogo', () => {
    it('should return error if no file provided', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, logo_url: null },
      });

      const formData = new FormData();

      const result = await uploadMyBrandLogo({}, formData);

      expect(result).toEqual({ error: 'Pilih file logo untuk diunggah' });
    });

    it('should return error for invalid file type', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, logo_url: null },
      });

      const formData = new FormData();
      formData.append(
        'logo',
        createMockFile('doc', 'file.pdf', 'application/pdf')
      );

      const result = await uploadMyBrandLogo({}, formData);

      expect(result).toEqual({
        error:
          'Format file tidak valid. Hanya JPEG, PNG, WebP, dan SVG yang diizinkan',
      });
    });

    it('should return error for file larger than 5MB', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, logo_url: null },
      });

      const largeContent = 'x'.repeat(6 * 1024 * 1024);
      const formData = new FormData();
      formData.append(
        'logo',
        createMockFile(largeContent, 'large.jpg', 'image/jpeg')
      );

      const result = await uploadMyBrandLogo({}, formData);

      expect(result).toEqual({
        error: 'Ukuran file harus kurang dari 5MB',
      });
    });

    it('should handle database errors during upload', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, logo_url: null },
      });
      mockPrismaClient.brand.update.mockRejectedValue(new Error('DB Error'));

      const formData = new FormData();
      formData.append(
        'logo',
        createMockFile('image data', 'logo.png', 'image/png')
      );

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await uploadMyBrandLogo({}, formData);

      expect(result).toEqual({ error: 'Gagal mengunggah logo' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Upload brand logo error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()
    // These would be better tested with integration/e2e tests
  });

  describe('removeMyBrandLogo', () => {
    it('should return error if no logo to remove', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: { id: 5, logo_url: null },
      });

      const result = await removeMyBrandLogo();

      expect(result).toEqual({ error: 'Tidak ada logo untuk dihapus' });
    });

    it('should remove logo successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: {
          id: 5,
          logo_url: 'https://r2.example.com/brands/logo.png',
        },
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.brand.update.mockResolvedValue({ id: 5 });

      const result = await removeMyBrandLogo();

      expect(result).toEqual({
        success: true,
        message: 'Logo berhasil dihapus',
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('brands/logo.png');
      expect(mockPrismaClient.brand.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { logo_url: null },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/my-brand');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('should handle database errors during removal', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand: {
          id: 5,
          logo_url: 'https://r2.example.com/brands/logo.png',
        },
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.brand.update.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await removeMyBrandLogo();

      expect(result).toEqual({ error: 'Gagal menghapus logo' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Remove brand logo error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
