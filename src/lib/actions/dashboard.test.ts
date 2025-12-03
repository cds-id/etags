import { describe, it, expect, beforeEach } from 'vitest';
import { getDashboardStats } from './dashboard';
import {
  mockPrismaClient,
  mockAuth,
  createMockSession,
  resetAllMocks,
} from '@/tests/mocks';

describe('dashboard actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getDashboardStats()).rejects.toThrow('Unauthorized');
    });

    it('should return all stats for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.count.mockResolvedValue(10);
      mockPrismaClient.product.count.mockResolvedValue(50);
      mockPrismaClient.tag.count
        .mockResolvedValueOnce(100) // All tags
        .mockResolvedValueOnce(75); // Stamped tags
      mockPrismaClient.tagNFT.count.mockResolvedValue(25);

      const result = await getDashboardStats();

      expect(result).toEqual({
        brands: 10,
        products: 50,
        tags: 100,
        stampedTags: 75,
        nfts: 25,
      });
    });

    it('should return brand-specific stats for brand user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '2', role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 5 });
      mockPrismaClient.product.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      mockPrismaClient.tag.findMany.mockResolvedValue([
        { product_ids: [1, 2], is_stamped: 1 },
        { product_ids: [3], is_stamped: 0 },
        { product_ids: [99], is_stamped: 1 }, // Different brand's product
      ]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(5);

      const result = await getDashboardStats();

      expect(result).toEqual({
        brands: 1,
        products: 3,
        tags: 2, // Only tags containing brand's products
        stampedTags: 1, // Only stamped tags containing brand's products
        nfts: 5,
      });
    });

    it('should return zero stats for brand user without brand assigned', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '2', role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: null });

      const result = await getDashboardStats();

      expect(result).toEqual({
        brands: 0,
        products: 0,
        tags: 0,
        stampedTags: 0,
        nfts: 0,
      });
    });

    it('should handle empty product list for brand', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '2', role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 5 });
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.tag.findMany.mockResolvedValue([]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(0);

      const result = await getDashboardStats();

      expect(result).toEqual({
        brands: 1,
        products: 0,
        tags: 0,
        stampedTags: 0,
        nfts: 0,
      });
    });

    it('should handle tags with non-array product_ids', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '2', role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 5 });
      mockPrismaClient.product.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrismaClient.tag.findMany.mockResolvedValue([
        { product_ids: null, is_stamped: 0 }, // null product_ids
        { product_ids: [1], is_stamped: 1 }, // Valid
      ]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(1);

      const result = await getDashboardStats();

      expect(result).toEqual({
        brands: 1,
        products: 1,
        tags: 1,
        stampedTags: 1,
        nfts: 1,
      });
    });

    it('should handle NFT count error gracefully for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.brand.count.mockResolvedValue(10);
      mockPrismaClient.product.count.mockResolvedValue(50);
      mockPrismaClient.tag.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75);
      mockPrismaClient.tagNFT.count.mockRejectedValue(
        new Error('TagNFT table does not exist')
      );

      const result = await getDashboardStats();

      expect(result).toEqual({
        brands: 10,
        products: 50,
        tags: 100,
        stampedTags: 75,
        nfts: 0,
      });
    });
  });
});
