import { describe, it, expect, beforeEach } from 'vitest';
import { getNFTs, getNFTById, getNFTStats, getRecentNFTs } from './nfts';
import {
  mockPrismaClient,
  mockAuth,
  createMockSession,
  resetAllMocks,
} from '@/tests/mocks';

// Mock NFT data
const mockNFT = {
  id: 1,
  tag_id: 1,
  token_id: '1',
  owner_address: '0x1234567890abcdef1234567890abcdef12345678',
  image_url: 'https://r2.example.com/nfts/TAG-001/image.png',
  metadata_url: 'https://r2.example.com/nfts/TAG-001/metadata.json',
  mint_tx_hash:
    '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  transfer_tx_hash: null,
  created_at: new Date('2025-01-15T10:00:00Z'),
  tag: {
    id: 1,
    code: 'TAG-001',
    product_ids: [1, 2],
  },
};

const mockProduct = {
  id: 1,
  code: 'PROD-001',
  brand_id: 1,
  metadata: { name: 'Test Product' },
  brand: {
    id: 1,
    name: 'Test Brand',
    logo_url: 'https://example.com/logo.png',
  },
};

describe('nfts actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getNFTs', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getNFTs({})).rejects.toThrow('Unauthorized');
    });

    it('should return NFTs with pagination for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(1);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTs({ page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.nfts).toHaveLength(1);
      expect(result.nfts[0].tokenId).toBe('1');
      expect(result.nfts[0].ownerAddress).toBe(mockNFT.owner_address);
      expect(result.nfts[0].tag.code).toBe('TAG-001');
      expect(result.nfts[0].product?.name).toBe('Test Product');
      expect(result.nfts[0].brand?.name).toBe('Test Brand');
    });

    it('should filter NFTs by search query', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(1);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      await getNFTs({ search: 'TAG-001' });

      expect(mockPrismaClient.tagNFT.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { tag: { code: { contains: 'TAG-001' } } },
              { owner_address: { contains: 'TAG-001' } },
            ]),
          }),
        })
      );
    });

    it('should filter NFTs for brand users by their products', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '1' })
      );
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(1);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTs({});

      // Should filter to only show NFTs belonging to brand's products
      expect(result.nfts).toHaveLength(1);
      expect(result.nfts[0].brand?.id).toBe(1);
    });

    it('should filter out NFTs from other brands for brand user', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '2' })
      );
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(1);
      // Product belongs to brand 1, not brand 2
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTs({});

      // NFT should be filtered out since it belongs to brand 1, not brand 2
      expect(result.nfts).toHaveLength(0);
    });

    it('should return empty array when TagNFT table does not exist', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findMany.mockRejectedValue(
        new Error('Table does not exist')
      );

      const result = await getNFTs({});

      expect(result.nfts).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle NFT without product association', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const nftWithoutProduct = {
        ...mockNFT,
        tag: { ...mockNFT.tag, product_ids: [] },
      };
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([nftWithoutProduct]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(1);

      const result = await getNFTs({});

      expect(result.nfts).toHaveLength(1);
      expect(result.nfts[0].product).toBeNull();
      expect(result.nfts[0].brand).toBeNull();
    });

    it('should apply pagination correctly', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(25);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      await getNFTs({ page: 3, limit: 5 });

      expect(mockPrismaClient.tagNFT.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (3-1) * 5
          take: 5,
        })
      );
    });
  });

  describe('getNFTById', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getNFTById(1)).rejects.toThrow('Unauthorized');
    });

    it('should return NFT details by ID', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findUnique.mockResolvedValue(mockNFT);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTById(1);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.tokenId).toBe('1');
      expect(result?.tag.code).toBe('TAG-001');
      expect(result?.product?.name).toBe('Test Product');
    });

    it('should return null if NFT not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findUnique.mockResolvedValue(null);

      const result = await getNFTById(999);

      expect(result).toBeNull();
    });

    it('should return null for brand user accessing other brand NFT', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '2' })
      );
      mockPrismaClient.tagNFT.findUnique.mockResolvedValue(mockNFT);
      // Product belongs to brand 1, not brand 2
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      // The function catches the Unauthorized error and returns null
      const result = await getNFTById(1);
      expect(result).toBeNull();
    });

    it('should allow brand user to access their own brand NFT', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '1' })
      );
      mockPrismaClient.tagNFT.findUnique.mockResolvedValue(mockNFT);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTById(1);

      expect(result).not.toBeNull();
      expect(result?.brand?.id).toBe(1);
    });

    it('should handle NFT without product association', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const nftWithoutProduct = {
        ...mockNFT,
        tag: { ...mockNFT.tag, product_ids: [] },
      };
      mockPrismaClient.tagNFT.findUnique.mockResolvedValue(nftWithoutProduct);

      const result = await getNFTById(1);

      expect(result).not.toBeNull();
      expect(result?.product).toBeNull();
      expect(result?.brand).toBeNull();
    });

    it('should return null on database error', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findUnique.mockRejectedValue(
        new Error('Database error')
      );

      const result = await getNFTById(1);

      expect(result).toBeNull();
    });
  });

  describe('getNFTStats', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getNFTStats()).rejects.toThrow('Unauthorized');
    });

    it('should return NFT statistics for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.count
        .mockResolvedValueOnce(100) // totalMinted
        .mockResolvedValueOnce(5) // mintedToday
        .mockResolvedValueOnce(20) // mintedThisWeek
        .mockResolvedValueOnce(50); // mintedThisMonth
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTStats();

      expect(result.totalMinted).toBe(100);
      expect(result.mintedToday).toBe(5);
      expect(result.mintedThisWeek).toBe(20);
      expect(result.mintedThisMonth).toBe(50);
      expect(result.byBrand).toHaveLength(1);
      expect(result.byBrand[0].brandName).toBe('Test Brand');
    });

    it('should return filtered stats for brand user', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '1' })
      );
      mockPrismaClient.tagNFT.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(50);
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([mockNFT]);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getNFTStats();

      // Brand user should only see their brand's count
      expect(result.byBrand).toHaveLength(1);
      expect(result.byBrand[0].brandId).toBe(1);
    });

    it('should return zero stats when TagNFT table does not exist', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.count.mockRejectedValue(
        new Error('Table does not exist')
      );

      const result = await getNFTStats();

      expect(result.totalMinted).toBe(0);
      expect(result.mintedToday).toBe(0);
      expect(result.mintedThisWeek).toBe(0);
      expect(result.mintedThisMonth).toBe(0);
      expect(result.byBrand).toEqual([]);
    });

    it('should handle NFTs without product association in stats', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(8);
      const nftWithoutProduct = {
        ...mockNFT,
        tag: { ...mockNFT.tag, product_ids: [] },
      };
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([nftWithoutProduct]);

      const result = await getNFTStats();

      expect(result.totalMinted).toBe(10);
      // byBrand should be empty since no product association
      expect(result.byBrand).toEqual([]);
    });
  });

  describe('getRecentNFTs', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getRecentNFTs()).rejects.toThrow('Unauthorized');
    });

    it('should return recent NFTs with default limit of 5', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const nfts = Array(5)
        .fill(null)
        .map((_, i) => ({
          ...mockNFT,
          id: i + 1,
          token_id: String(i + 1),
        }));
      mockPrismaClient.tagNFT.findMany.mockResolvedValue(nfts);
      mockPrismaClient.tagNFT.count.mockResolvedValue(5);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getRecentNFTs();

      expect(result).toHaveLength(5);
    });

    it('should respect custom limit', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const nfts = Array(3)
        .fill(null)
        .map((_, i) => ({
          ...mockNFT,
          id: i + 1,
          token_id: String(i + 1),
        }));
      mockPrismaClient.tagNFT.findMany.mockResolvedValue(nfts);
      mockPrismaClient.tagNFT.count.mockResolvedValue(3);
      mockPrismaClient.product.findFirst.mockResolvedValue(mockProduct);

      const result = await getRecentNFTs(3);

      expect(result).toHaveLength(3);
    });

    it('should return empty array when no NFTs exist', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([]);
      mockPrismaClient.tagNFT.count.mockResolvedValue(0);

      const result = await getRecentNFTs();

      expect(result).toEqual([]);
    });
  });
});
