import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from './products';
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

describe('products actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getProducts', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getProducts()).rejects.toThrow('Unauthorized');
    });

    it('should return all products for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockProducts = [
        { id: 1, code: 'PRD-001', brand: { id: 1, name: 'Brand 1' } },
        { id: 2, code: 'PRD-002', brand: { id: 2, name: 'Brand 2' } },
      ];
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaClient.product.count.mockResolvedValue(2);

      const result = await getProducts(1, 10);

      expect(result.products).toEqual(mockProducts);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter products by brand for brand users', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      const mockProducts = [
        {
          id: 1,
          code: 'PRD-001',
          brand_id: 1,
          brand: { id: 1, name: 'Brand 1' },
        },
      ];
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaClient.product.count.mockResolvedValue(1);

      await getProducts(1, 10);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { brand_id: 1 },
        })
      );
    });

    it('should throw error if brand user has no brand assigned', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: null });

      await expect(getProducts()).rejects.toThrow(
        'Brand user must have a brand assigned'
      );
    });
  });

  describe('getAllProducts', () => {
    it('should return active products for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockProducts = [
        { id: 1, code: 'PRD-001', metadata: { name: 'Product 1' } },
      ];
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      const result = await getAllProducts();

      expect(result).toEqual(mockProducts);
      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 1 },
        })
      );
    });

    it('should filter by brand for brand users', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 5 });
      mockPrismaClient.product.findMany.mockResolvedValue([]);

      await getAllProducts();

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 1, brand_id: 5 },
        })
      );
    });
  });

  describe('getProductById', () => {
    it('should return product for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockProduct = {
        id: 1,
        code: 'PRD-001',
        brand_id: 1,
        brand: { id: 1, name: 'Brand' },
      };
      mockPrismaClient.product.findUnique.mockResolvedValue(mockProduct);

      const result = await getProductById(1);

      expect(result).toEqual(mockProduct);
    });

    it('should throw error if brand user accesses another brands product', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      const mockProduct = {
        id: 1,
        code: 'PRD-001',
        brand_id: 2, // Different brand
        brand: { id: 2, name: 'Other Brand' },
      };
      mockPrismaClient.product.findUnique.mockResolvedValue(mockProduct);

      await expect(getProductById(1)).rejects.toThrow(
        'Unauthorized: Cannot access this product'
      );
    });
  });

  describe('createProduct', () => {
    it('should return error if brand_id is missing for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        brand_id: '',
        template_id: 'basic',
        metadata: JSON.stringify({ name: 'Product' }),
        status: '1',
      });

      const result = await createProduct({}, formData);

      expect(result).toEqual({ error: 'Brand and template are required' });
    });

    it('should return error if template_id is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        brand_id: '1',
        template_id: '',
        metadata: JSON.stringify({ name: 'Product' }),
        status: '1',
      });

      const result = await createProduct({}, formData);

      expect(result).toEqual({ error: 'Brand and template are required' });
    });

    it('should return error for invalid metadata JSON', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        brand_id: '1',
        template_id: 'basic',
        metadata: 'invalid json',
        status: '1',
      });

      const result = await createProduct({}, formData);

      expect(result).toEqual({ error: 'Invalid product data' });
    });

    it('should create product successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.create.mockResolvedValue({
        id: 1,
        code: 'PRD-123',
      });

      const formData = createMockFormData({
        brand_id: '1',
        template_id: 'basic',
        metadata: JSON.stringify({ name: 'New Product', images: [] }),
        status: '1',
      });

      const result = await createProduct({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Product created successfully',
      });
      expect(mockPrismaClient.product.create).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/products');
    });

    it('should use brand users brand_id', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 5 });
      mockPrismaClient.product.create.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        brand_id: '99', // Should be ignored
        template_id: 'basic',
        metadata: JSON.stringify({ name: 'Product', images: [] }),
        status: '1',
      });

      const result = await createProduct({}, formData);

      expect(result.success).toBe(true);
      expect(mockPrismaClient.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            brand_id: 5, // Should use user's brand
          }),
        })
      );
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()
    // These would be better tested with integration/e2e tests

    it('should reject invalid image types', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = new FormData();
      formData.append('brand_id', '1');
      formData.append('template_id', 'basic');
      formData.append(
        'metadata',
        JSON.stringify({ name: 'Product', images: [] })
      );
      formData.append('status', '1');
      formData.append(
        'images',
        createMockFile('doc', 'file.pdf', 'application/pdf')
      );

      const result = await createProduct({}, formData);

      expect(result).toEqual({
        error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed',
      });
    });
  });

  describe('updateProduct', () => {
    it('should return error if brand_id is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        brand_id: '',
        metadata: JSON.stringify({ name: 'Product' }),
        status: '1',
      });

      const result = await updateProduct(1, {}, formData);

      expect(result).toEqual({ error: 'Brand is required' });
    });

    it('should prevent brand user from updating other brands products', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.product.findUnique.mockResolvedValue({
        metadata: {},
        brand_id: 2, // Different brand
      });

      const formData = createMockFormData({
        brand_id: '1',
        metadata: JSON.stringify({ name: 'Product' }),
        status: '1',
      });

      const result = await updateProduct(1, {}, formData);

      expect(result).toEqual({
        error: 'Unauthorized: Cannot update this product',
      });
    });

    it('should update product successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue({
        metadata: { images: [] },
        brand_id: 1,
      });
      mockPrismaClient.product.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        brand_id: '1',
        metadata: JSON.stringify({ name: 'Updated Product', images: [] }),
        status: '1',
        removed_images: '[]',
      });

      const result = await updateProduct(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Product updated successfully',
      });
    });

    it('should delete removed images from R2', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue({
        metadata: { images: ['https://r2.example.com/products/old.jpg'] },
        brand_id: 1,
      });
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.product.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        brand_id: '1',
        metadata: JSON.stringify({ name: 'Product', images: [] }),
        status: '1',
        removed_images: JSON.stringify([
          'https://r2.example.com/products/old.jpg',
        ]),
      });

      const result = await updateProduct(1, {}, formData);

      expect(result.success).toBe(true);
      expect(mockDeleteFile).toHaveBeenCalledWith('products/old.jpg');
    });
  });

  describe('deleteProduct', () => {
    it('should return error if product not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      const result = await deleteProduct(999);

      expect(result).toEqual({ error: 'Product not found' });
    });

    it('should prevent brand user from deleting other brands products', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.product.findUnique.mockResolvedValue({
        metadata: {},
        brand_id: 2,
      });

      const result = await deleteProduct(1);

      expect(result).toEqual({
        error: 'Unauthorized: Cannot delete this product',
      });
    });

    it('should return error if product is used in tags', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue({
        metadata: {},
        brand_id: 1,
      });
      mockPrismaClient.tag.findFirst.mockResolvedValue({ id: 1 });

      const result = await deleteProduct(1);

      expect(result).toEqual({
        error: 'Cannot delete product. It is associated with one or more tags.',
      });
    });

    it('should delete product and images successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue({
        metadata: { images: ['https://r2.example.com/products/img.jpg'] },
        brand_id: 1,
      });
      mockPrismaClient.tag.findFirst.mockResolvedValue(null);
      mockDeleteFile.mockResolvedValue(undefined);
      mockPrismaClient.product.delete.mockResolvedValue({ id: 1 });

      const result = await deleteProduct(1);

      expect(result).toEqual({
        success: true,
        message: 'Product deleted successfully',
      });
      expect(mockDeleteFile).toHaveBeenCalledWith('products/img.jpg');
      expect(mockPrismaClient.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('toggleProductStatus', () => {
    it('should return error if product not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      const result = await toggleProductStatus(999);

      expect(result).toEqual({ error: 'Product not found' });
    });

    it('should prevent brand user from toggling other brands products', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.product.findUnique.mockResolvedValue({
        status: 1,
        brand_id: 2,
      });

      const result = await toggleProductStatus(1);

      expect(result).toEqual({
        error: 'Unauthorized: Cannot update this product',
      });
    });

    it('should toggle status from 1 to 0', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.findUnique.mockResolvedValue({
        status: 1,
        brand_id: 1,
      });
      mockPrismaClient.product.update.mockResolvedValue({ id: 1 });

      const result = await toggleProductStatus(1);

      expect(result).toEqual({
        success: true,
        message: 'Product status updated',
      });
      expect(mockPrismaClient.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 0 },
      });
    });
  });
});
