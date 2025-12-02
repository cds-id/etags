import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOnboardingStatus,
  createOnboardingBrand,
  createOnboardingProduct,
  createOnboardingTag,
  completeOnboarding,
  getOnboardingProducts,
} from './onboarding';
import {
  mockPrismaClient,
  mockAuth,
  mockRevalidatePath,
  createMockSession,
  createMockFormData,
  createMockFile,
  resetAllMocks,
} from '@/tests/mocks';

describe('onboarding actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getOnboardingStatus', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getOnboardingStatus()).rejects.toThrow('Unauthorized');
    });

    it('should return step 0 if user not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await getOnboardingStatus();

      expect(result).toEqual({ step: 0, complete: false });
    });

    it('should return step 1 if user has no brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand_id: null,
        brand: null,
      });

      const result = await getOnboardingStatus();

      expect(result).toEqual({
        step: 1,
        complete: false,
        hasBrand: false,
        hasProduct: false,
        hasTag: false,
      });
    });

    it('should return step 2 if user has brand but no products', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 5,
        brand: {
          id: 5,
          name: 'Test Brand',
          products: [],
        },
      });

      const result = await getOnboardingStatus();

      expect(result).toEqual({
        step: 2,
        complete: false,
        hasBrand: true,
        hasProduct: false,
        hasTag: false,
        brandId: 5,
        brandName: 'Test Brand',
      });
    });

    it('should return step 3 if user has products but no tags', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 5,
        brand: {
          id: 5,
          name: 'Test Brand',
          products: [{ id: 1, code: 'PRD-001' }],
        },
      });
      mockPrismaClient.tag.findFirst.mockResolvedValue(null);

      const result = await getOnboardingStatus();

      expect(result).toEqual({
        step: 3,
        complete: false,
        hasBrand: true,
        hasProduct: true,
        hasTag: false,
        brandId: 5,
        brandName: 'Test Brand',
        productId: 1,
      });
    });

    it('should return step 4 complete if user has brand, products, and tags', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 5,
        brand: {
          id: 5,
          name: 'Test Brand',
          products: [{ id: 1, code: 'PRD-001' }],
        },
      });
      mockPrismaClient.tag.findFirst.mockResolvedValue({
        id: 1,
        product_ids: [1],
      });

      const result = await getOnboardingStatus();

      expect(result).toEqual({
        step: 4,
        complete: true,
        hasBrand: true,
        hasProduct: true,
        hasTag: true,
        brandId: 5,
        brandName: 'Test Brand',
      });
    });
  });

  describe('createOnboardingBrand', () => {
    it('should return error if name is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        name: '',
        descriptions: 'Description',
      });

      const result = await createOnboardingBrand({}, formData);

      expect(result).toEqual({
        error: 'Nama dan deskripsi brand wajib diisi',
      });
    });

    it('should return error if descriptions is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = createMockFormData({
        name: 'Brand Name',
        descriptions: '',
      });

      const result = await createOnboardingBrand({}, formData);

      expect(result).toEqual({
        error: 'Nama dan deskripsi brand wajib diisi',
      });
    });

    it('should create brand without logo', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.brand.create.mockResolvedValue({
        id: 1,
        name: 'New Brand',
      });
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        name: 'New Brand',
        descriptions: 'Brand description',
      });

      const result = await createOnboardingBrand({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Brand berhasil dibuat',
        brandId: 1,
      });
      expect(mockPrismaClient.brand.create).toHaveBeenCalledWith({
        data: {
          name: 'New Brand',
          descriptions: 'Brand description',
          status: 1,
          logo_url: null,
        },
      });
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { brand_id: 1 },
      });
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()

    it('should reject invalid logo file types', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));

      const formData = new FormData();
      formData.append('name', 'New Brand');
      formData.append('descriptions', 'Description');
      formData.append(
        'logo',
        createMockFile('doc', 'file.pdf', 'application/pdf')
      );

      const result = await createOnboardingBrand({}, formData);

      expect(result).toEqual({
        error:
          'Format file tidak valid. Hanya JPEG, PNG, WebP, dan SVG yang diperbolehkan',
      });
    });
  });

  describe('createOnboardingProduct', () => {
    it('should return error if user has no brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: null });

      const formData = createMockFormData({
        name: 'Product',
        description: 'Description',
      });

      const result = await createOnboardingProduct({}, formData);

      expect(result).toEqual({
        error: 'Anda harus membuat brand terlebih dahulu',
      });
    });

    it('should return error if name is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });

      const formData = createMockFormData({
        name: '',
        description: 'Description',
      });

      const result = await createOnboardingProduct({}, formData);

      expect(result).toEqual({
        error: 'Nama dan deskripsi produk wajib diisi',
      });
    });

    it('should create product successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.product.create.mockResolvedValue({
        id: 1,
        code: 'PRD-123',
      });

      const formData = createMockFormData({
        name: 'New Product',
        description: 'Product description',
        category: 'Electronics',
        price: '100',
        sku: 'SKU-001',
      });

      const result = await createOnboardingProduct({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Produk berhasil dibuat',
        productId: 1,
      });
      expect(mockPrismaClient.product.create).toHaveBeenCalled();
    });

    // File upload tests are skipped because JSDOM doesn't properly implement File.arrayBuffer()
  });

  describe('createOnboardingTag', () => {
    it('should return error if user has no brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: null,
        brand: null,
      });

      const formData = createMockFormData({
        productId: '1',
      });

      const result = await createOnboardingTag({}, formData);

      expect(result).toEqual({
        error: 'Anda harus membuat brand terlebih dahulu',
      });
    });

    it('should return error if user has no products', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: 1,
        brand: {
          products: [],
        },
      });

      const formData = createMockFormData({
        productId: '1',
      });

      const result = await createOnboardingTag({}, formData);

      expect(result).toEqual({
        error: 'Anda harus membuat produk terlebih dahulu',
      });
    });

    it('should return error if productId is missing', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: 1,
        brand: {
          products: [{ id: 1 }],
        },
      });

      const formData = createMockFormData({
        productId: '',
      });

      const result = await createOnboardingTag({}, formData);

      expect(result).toEqual({ error: 'Pilih produk untuk tag' });
    });

    it('should return error if product does not belong to brand', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '1', name: 'Test User' })
      );
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: 1,
        brand: {
          products: [{ id: 1 }],
        },
      });

      const formData = createMockFormData({
        productId: '999', // Different product
      });

      const result = await createOnboardingTag({}, formData);

      expect(result).toEqual({ error: 'Produk tidak valid' });
    });

    it('should create tag successfully', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '1', name: 'Test User' })
      );
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: 1,
        brand: {
          products: [{ id: 1 }],
        },
      });
      mockPrismaClient.tag.create.mockResolvedValue({
        id: 1,
        code: 'TAG-123',
      });

      const formData = createMockFormData({
        productId: '1',
        distributorName: 'Distributor A',
        distributorLocation: 'Jakarta',
        batchNumber: 'BATCH-001',
        notes: 'Test notes',
      });

      const result = await createOnboardingTag({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Tag berhasil dibuat',
        tagId: 1,
      });
      expect(mockPrismaClient.tag.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          product_ids: [1],
          is_stamped: 0,
          publish_status: 0,
          metadata: expect.objectContaining({
            distribution_region: 'Jakarta',
            batch_number: 'BATCH-001',
            notes: 'Test notes',
            distributor_name: 'Distributor A',
            createdBy: 'Test User',
          }),
        }),
      });
    });
  });

  describe('completeOnboarding', () => {
    it('should mark onboarding as complete', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.update.mockResolvedValue({ id: 1 });

      await completeOnboarding();

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { onboarding_complete: 1 },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage');
    });
  });

  describe('getOnboardingProducts', () => {
    it('should return empty array if user has no brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: null,
        brand: null,
      });

      const result = await getOnboardingProducts();

      expect(result).toEqual([]);
    });

    it('should return products with names', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '1' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({
        brand_id: 1,
        brand: {
          products: [
            { id: 1, code: 'PRD-001', metadata: { name: 'Product 1' } },
            { id: 2, code: 'PRD-002', metadata: { name: 'Product 2' } },
            { id: 3, code: 'PRD-003', metadata: {} }, // No name
          ],
        },
      });

      const result = await getOnboardingProducts();

      expect(result).toEqual([
        { id: 1, code: 'PRD-001', name: 'Product 1' },
        { id: 2, code: 'PRD-002', name: 'Product 2' },
        { id: 3, code: 'PRD-003', name: 'Produk Tanpa Nama' },
      ]);
    });
  });
});
