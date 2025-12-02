import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBrands,
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} from './brands';
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

describe('brands actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getBrands', () => {
    it('should throw error if user is not admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));

      await expect(getBrands()).rejects.toThrow(
        'Unauthorized: Admin access required'
      );
    });

    it('should return paginated brands for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockBrands = [
        { id: 1, name: 'Brand 1', _count: { products: 5 } },
        { id: 2, name: 'Brand 2', _count: { products: 3 } },
      ];
      mockPrismaClient.brand.findMany.mockResolvedValue(mockBrands);
      mockPrismaClient.brand.count.mockResolvedValue(2);

      const result = await getBrands(1, 10);

      expect(result.brands).toEqual(mockBrands);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should handle pagination correctly', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findMany.mockResolvedValue([]);
      mockPrismaClient.brand.count.mockResolvedValue(25);

      const result = await getBrands(2, 10);

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(mockPrismaClient.brand.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { products: true } } },
      });
    });
  });

  describe('getAllBrands', () => {
    it('should return all active brands for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockBrands = [
        { id: 1, name: 'Brand A' },
        { id: 2, name: 'Brand B' },
      ];
      mockPrismaClient.brand.findMany.mockResolvedValue(mockBrands);

      const result = await getAllBrands();

      expect(result).toEqual(mockBrands);
      expect(mockPrismaClient.brand.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      });
    });
  });

  describe('getBrandById', () => {
    it('should return brand by id for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockBrand = {
        id: 1,
        name: 'Test Brand',
        _count: { products: 10 },
      };
      mockPrismaClient.brand.findUnique.mockResolvedValue(mockBrand);

      const result = await getBrandById(1);

      expect(result).toEqual(mockBrand);
      expect(mockPrismaClient.brand.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { _count: { select: { products: true } } },
      });
    });

    it('should return null if brand not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue(null);

      const result = await getBrandById(999);

      expect(result).toBeNull();
    });
  });

  describe('createBrand', () => {
    it('should return error if name is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        name: '',
        descriptions: 'Description',
        status: '1',
      });

      const result = await createBrand({}, formData);

      expect(result).toEqual({ error: 'Name and description are required' });
    });

    it('should return error if description is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        name: 'Brand Name',
        descriptions: '',
        status: '1',
      });

      const result = await createBrand({}, formData);

      expect(result).toEqual({ error: 'Name and description are required' });
    });

    it('should create brand without logo', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.create.mockResolvedValue({
        id: 1,
        name: 'New Brand',
      });

      const formData = createMockFormData({
        name: 'New Brand',
        descriptions: 'Brand description',
        status: '1',
      });

      const result = await createBrand({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Brand created successfully',
      });
      expect(mockPrismaClient.brand.create).toHaveBeenCalledWith({
        data: {
          name: 'New Brand',
          descriptions: 'Brand description',
          status: 1,
          logo_url: null,
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/brands');
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()
    // These would be better tested with integration/e2e tests

    it('should reject invalid file types', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = new FormData();
      formData.append('name', 'New Brand');
      formData.append('descriptions', 'Brand description');
      formData.append('status', '1');
      formData.append(
        'logo',
        createMockFile('doc content', 'file.pdf', 'application/pdf')
      );

      const result = await createBrand({}, formData);

      expect(result).toEqual({
        error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed',
      });
    });

    it('should reject files larger than 5MB', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const largeContent = 'x'.repeat(6 * 1024 * 1024);
      const formData = new FormData();
      formData.append('name', 'New Brand');
      formData.append('descriptions', 'Brand description');
      formData.append('status', '1');
      formData.append(
        'logo',
        createMockFile(largeContent, 'large.png', 'image/png')
      );

      const result = await createBrand({}, formData);

      expect(result).toEqual({ error: 'File size must be less than 5MB' });
    });
  });

  describe('updateBrand', () => {
    it('should update brand without changing logo', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        logo_url: 'https://r2.example.com/existing.png',
      });
      mockPrismaClient.brand.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        name: 'Updated Brand',
        descriptions: 'Updated description',
        status: '1',
        removeLogo: 'false',
      });

      const result = await updateBrand(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Brand updated successfully',
      });
      expect(mockPrismaClient.brand.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Brand',
          descriptions: 'Updated description',
          status: 1,
          logo_url: 'https://r2.example.com/existing.png',
        },
      });
    });

    it('should remove logo when requested', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        logo_url: 'https://r2.example.com/brands/existing.png',
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.brand.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        name: 'Updated Brand',
        descriptions: 'Updated description',
        status: '1',
        removeLogo: 'true',
      });

      const result = await updateBrand(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Brand updated successfully',
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('brands/existing.png');
    });
  });

  describe('deleteBrand', () => {
    it('should return error if brand not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue(null);

      const result = await deleteBrand(999);

      expect(result).toEqual({ error: 'Brand not found' });
    });

    it('should return error if brand has products', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        id: 1,
        logo_url: null,
        _count: { products: 5 },
      });

      const result = await deleteBrand(1);

      expect(result).toEqual({
        error:
          'Cannot delete brand with existing products. Delete products first.',
      });
    });

    it('should delete brand successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        id: 1,
        logo_url: null,
        _count: { products: 0 },
      });
      mockPrismaClient.brand.delete.mockResolvedValue({ id: 1 });

      const result = await deleteBrand(1);

      expect(result).toEqual({
        success: true,
        message: 'Brand deleted successfully',
      });
      expect(mockPrismaClient.brand.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should delete brand logo from R2', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        id: 1,
        logo_url: 'https://r2.example.com/brands/logo.png',
        _count: { products: 0 },
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.brand.delete.mockResolvedValue({ id: 1 });

      const result = await deleteBrand(1);

      expect(result).toEqual({
        success: true,
        message: 'Brand deleted successfully',
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('brands/logo.png');
    });
  });

  describe('toggleBrandStatus', () => {
    it('should return error if brand not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue(null);

      const result = await toggleBrandStatus(999);

      expect(result).toEqual({ error: 'Brand not found' });
    });

    it('should toggle status from 1 to 0', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        id: 1,
        status: 1,
      });
      mockPrismaClient.brand.update.mockResolvedValue({ id: 1, status: 0 });

      const result = await toggleBrandStatus(1);

      expect(result).toEqual({
        success: true,
        message: 'Brand status updated',
      });
      expect(mockPrismaClient.brand.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 0 },
      });
    });

    it('should toggle status from 0 to 1', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.findUnique.mockResolvedValue({
        id: 1,
        status: 0,
      });
      mockPrismaClient.brand.update.mockResolvedValue({ id: 1, status: 1 });

      const result = await toggleBrandStatus(1);

      expect(result).toEqual({
        success: true,
        message: 'Brand status updated',
      });
      expect(mockPrismaClient.brand.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 1 },
      });
    });
  });
});
