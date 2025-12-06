import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTags,
  getTagById,
  getTagByCode,
  createTag,
  updateTag,
  deleteTag,
  toggleTagPublishStatus,
  getStampingPreview,
  stampTagToBlockchain,
  updateChainStatus,
  revokeTagOnBlockchain,
  getTagUrls,
  getTagScans,
  getAllTagScanLocations,
} from './tags';
import {
  mockPrismaClient,
  mockAuth,
  mockRevalidatePath,
  createMockSession,
  createMockFormData,
  resetAllMocks,
} from '@/tests/mocks';
import { CHAIN_STATUS } from '@/lib/constants';

// Mock blockchain tag-sync functions
const mockUpdateTagChainStatus = vi.fn();
const mockRevokeTagOnChain = vi.fn();
vi.mock('@/lib/tag-sync', () => ({
  updateTagChainStatus: (...args: unknown[]) =>
    mockUpdateTagChainStatus(...args),
  revokeTagOnChain: (...args: unknown[]) => mockRevokeTagOnChain(...args),
}));

describe('tags actions', () => {
  beforeEach(() => {
    resetAllMocks();
    mockUpdateTagChainStatus.mockClear();
    mockRevokeTagOnChain.mockClear();
  });

  describe('getTags', () => {
    it('should throw error if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(getTags()).rejects.toThrow('Unauthorized');
    });

    it('should return all tags for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockTags = [
        { id: 1, code: 'TAG-001', product_ids: [1, 2] },
        { id: 2, code: 'TAG-002', product_ids: [3] },
      ];
      mockPrismaClient.tag.findMany.mockResolvedValue(mockTags);
      mockPrismaClient.product.findMany.mockResolvedValue([]);

      const result = await getTags(1, 10);

      expect(result.tags.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter tags for brand users', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.product.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // Brand products
        .mockResolvedValue([]); // Products for tags
      const mockTags = [
        { id: 1, code: 'TAG-001', product_ids: [1] }, // Brand's product
        { id: 2, code: 'TAG-002', product_ids: [99] }, // Other brand's product
      ];
      mockPrismaClient.tag.findMany.mockResolvedValue(mockTags);

      const result = await getTags(1, 10);

      expect(result.tags.length).toBe(1);
      expect(result.tags[0].code).toBe('TAG-001');
    });
  });

  describe('getTagById', () => {
    it('should return null if tag not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue(null);

      const result = await getTagById(999);

      expect(result).toBeNull();
    });

    it('should return tag with products for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockTag = { id: 1, code: 'TAG-001', product_ids: [1, 2] };
      mockPrismaClient.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaClient.product.findMany.mockResolvedValue([
        { id: 1, code: 'PRD-001' },
        { id: 2, code: 'PRD-002' },
      ]);

      const result = await getTagById(1);

      expect(result).toMatchObject({
        id: 1,
        code: 'TAG-001',
      });
      expect(result?.products.length).toBe(2);
    });

    it('should throw error if brand user cannot access tag', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        product_ids: [99], // Not brand's product
      });
      mockPrismaClient.product.findMany.mockResolvedValue([]); // No brand products match

      await expect(getTagById(1)).rejects.toThrow(
        'Unauthorized: Cannot access this tag'
      );
    });
  });

  describe('getTagByCode', () => {
    it('should return null if tag not found', async () => {
      mockPrismaClient.tag.findUnique.mockResolvedValue(null);

      const result = await getTagByCode('INVALID');

      expect(result).toBeNull();
    });

    it('should return null if tag is not published', async () => {
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        publish_status: 0, // Not published
      });

      const result = await getTagByCode('TAG-001');

      expect(result).toBeNull();
    });

    it('should return published tag with products', async () => {
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        publish_status: 1,
        product_ids: [1],
      });
      mockPrismaClient.product.findMany.mockResolvedValue([
        { id: 1, code: 'PRD-001', status: 1 },
      ]);

      const result = await getTagByCode('TAG-001');

      expect(result).toMatchObject({
        id: 1,
        code: 'TAG-001',
      });
    });
  });

  describe('createTag', () => {
    it('should return error if product_ids is empty', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        product_ids: '[]',
        metadata: '{}',
        publish_status: '0',
      });

      const result = await createTag({}, formData);

      expect(result).toEqual({ error: 'At least one product is required' });
    });

    it('should return error for invalid data format', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const formData = createMockFormData({
        product_ids: 'invalid',
        metadata: '{}',
        publish_status: '0',
      });

      const result = await createTag({}, formData);

      expect(result).toEqual({ error: 'Invalid data format' });
    });

    it('should return error if products do not exist', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.count.mockResolvedValue(1); // Only 1 exists out of 2

      const formData = createMockFormData({
        product_ids: '[1, 2]',
        metadata: '{}',
        publish_status: '0',
      });

      const result = await createTag({}, formData);

      expect(result).toEqual({
        error: 'One or more selected products do not exist',
      });
    });

    it('should create tag successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.product.count.mockResolvedValue(2);
      mockPrismaClient.tag.create.mockResolvedValue({
        id: 1,
        code: 'TAG-123',
      });

      const formData = createMockFormData({
        product_ids: '[1, 2]',
        metadata: '{"note": "test"}',
        publish_status: '1',
      });

      const result = await createTag({}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Tag created successfully',
      });
      expect(mockPrismaClient.tag.create).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/tags');
    });

    it('should verify products belong to brand for brand users', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'brand' }));
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 1 });
      mockPrismaClient.product.findMany.mockResolvedValue([{ id: 1 }]); // Only product 1 belongs to brand

      const formData = createMockFormData({
        product_ids: '[1, 2]', // Trying to use product 2 which doesn't belong to brand
        metadata: '{}',
        publish_status: '0',
      });

      const result = await createTag({}, formData);

      expect(result).toEqual({
        error: 'You can only create tags for your own products',
      });
    });
  });

  describe('updateTag', () => {
    it('should only update publish_status for stamped tags', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        is_stamped: 1,
      });
      mockPrismaClient.tag.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        product_ids: '[1, 2]',
        metadata: '{}',
        publish_status: '1',
      });

      const result = await updateTag(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Tag publish status updated',
      });
      expect(mockPrismaClient.tag.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { publish_status: 1 },
      });
    });

    it('should return error if tag not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue(null);

      const formData = createMockFormData({
        product_ids: '[1]',
        metadata: '{}',
        publish_status: '0',
      });

      const result = await updateTag(999, {}, formData);

      expect(result).toEqual({ error: 'Tag not found' });
    });

    it('should update non-stamped tag fully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        is_stamped: 0,
      });
      mockPrismaClient.product.count.mockResolvedValue(2);
      mockPrismaClient.tag.update.mockResolvedValue({ id: 1 });

      const formData = createMockFormData({
        product_ids: '[1, 2]',
        metadata: '{"updated": true}',
        publish_status: '1',
      });

      const result = await updateTag(1, {}, formData);

      expect(result).toEqual({
        success: true,
        message: 'Tag updated successfully',
      });
    });
  });

  describe('deleteTag', () => {
    it('should return error if tag not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue(null);

      const result = await deleteTag(999);

      expect(result).toEqual({ error: 'Tag not found' });
    });

    it('should return error if tag is stamped', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        is_stamped: 1,
      });

      const result = await deleteTag(1);

      expect(result).toEqual({
        error: 'Cannot delete a tag that has been stamped to blockchain',
      });
    });

    it('should delete non-stamped tag successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        is_stamped: 0,
      });
      mockPrismaClient.tag.delete.mockResolvedValue({ id: 1 });

      const result = await deleteTag(1);

      expect(result).toEqual({
        success: true,
        message: 'Tag deleted successfully',
      });
      expect(mockPrismaClient.tag.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('toggleTagPublishStatus', () => {
    it('should return error if tag not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue(null);

      const result = await toggleTagPublishStatus(999);

      expect(result).toEqual({ error: 'Tag not found' });
    });

    it('should toggle publish_status from 1 to 0', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        publish_status: 1,
      });
      mockPrismaClient.tag.update.mockResolvedValue({ id: 1 });

      const result = await toggleTagPublishStatus(1);

      expect(result).toEqual({
        success: true,
        message: 'Tag publish status updated',
      });
      expect(mockPrismaClient.tag.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { publish_status: 0 },
      });
    });
  });

  describe('getStampingPreview', () => {
    it('should return reasons if tag cannot be stamped', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        is_stamped: 1, // Already stamped
        publish_status: 0, // Not published
        product_ids: [], // No products
      });

      const result = await getStampingPreview(1);

      expect(result.success).toBe(true);
      expect(result.canStamp).toBe(false);
      expect(result.reasons).toContain('Tag is already stamped to blockchain');
      expect(result.reasons).toContain('Tag must be published before stamping');
      expect(result.reasons).toContain(
        'Tag must have at least one product linked'
      );
    });

    it('should allow stamping when all conditions are met', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        is_stamped: 0,
        publish_status: 1,
        product_ids: [1, 2],
      });

      const result = await getStampingPreview(1);

      expect(result.success).toBe(true);
      expect(result.canStamp).toBe(true);
      expect(result.reasons).toBeUndefined();
    });
  });

  describe('stampTagToBlockchain', () => {
    it('should stamp tag successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const result = await stampTagToBlockchain(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Tag successfully stamped to blockchain');
      expect(result.data).toBeDefined();
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/tags');
    });
  });

  describe('updateChainStatus', () => {
    it('should return error when trying to set REVOKED status', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const result = await updateChainStatus(1, CHAIN_STATUS.REVOKED);

      expect(result).toEqual({
        error: 'Use revokeTagOnBlockchain to revoke a tag',
      });
    });

    it('should return error if tag is not stamped', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 0,
        chain_status: null,
      });

      const result = await updateChainStatus(1, CHAIN_STATUS.DISTRIBUTED);

      expect(result).toEqual({
        error: 'Tag must be stamped before updating chain status',
      });
    });

    it('should return error if tag is already revoked', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 1,
        chain_status: CHAIN_STATUS.REVOKED,
      });

      const result = await updateChainStatus(1, CHAIN_STATUS.DISTRIBUTED);

      expect(result).toEqual({
        error: 'Cannot update status of a revoked tag',
      });
    });

    it('should update chain status successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 1,
        chain_status: CHAIN_STATUS.CREATED,
      });
      mockUpdateTagChainStatus.mockResolvedValue({ success: true });

      const result = await updateChainStatus(1, CHAIN_STATUS.DISTRIBUTED);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Chain status updated successfully');
    });
  });

  describe('revokeTagOnBlockchain', () => {
    it('should return error if reason is empty', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const result = await revokeTagOnBlockchain(1, '');

      expect(result).toEqual({
        error: 'Reason is required for revoking a tag',
      });
    });

    it('should return error if tag is not stamped', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 0,
        chain_status: null,
      });

      const result = await revokeTagOnBlockchain(1, 'Counterfeit detected');

      expect(result).toEqual({
        error: 'Tag must be stamped before revoking',
      });
    });

    it('should return error if tag is already revoked', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 1,
        chain_status: CHAIN_STATUS.REVOKED,
      });

      const result = await revokeTagOnBlockchain(1, 'Counterfeit detected');

      expect(result).toEqual({ error: 'Tag is already revoked' });
    });

    it('should revoke tag successfully', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 1,
        chain_status: CHAIN_STATUS.DISTRIBUTED,
      });
      mockRevokeTagOnChain.mockResolvedValue({ success: true });

      const result = await revokeTagOnBlockchain(1, 'Counterfeit detected');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Tag has been revoked on blockchain');
    });
  });

  describe('getTagUrls', () => {
    it('should return null if tag is not stamped', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 0,
      });

      const result = await getTagUrls(1);

      expect(result).toBeNull();
    });

    it('should return URLs for stamped tag', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        id: 1,
        code: 'TAG-001',
        is_stamped: 1,
      });

      const result = await getTagUrls(1);

      expect(result).toEqual({
        metadataUrl: 'https://example.com/metadata',
        qrCodeUrl: 'https://example.com/qr',
      });
    });
  });

  describe('getTagScans', () => {
    it('should return null if tag not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue(null);

      const result = await getTagScans(999);

      expect(result).toBeNull();
    });

    it('should return scan statistics', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaClient.tagScan.findMany.mockResolvedValue([
        {
          id: 1,
          fingerprint_id: 'fp1',
          ip_address: '127.0.0.1',
          user_agent: 'Chrome',
          latitude: null,
          longitude: null,
          location_name: null,
          is_claimed: 1,
          is_first_hand: 1,
          source_info: null,
          scan_number: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          fingerprint_id: 'fp2',
          ip_address: '127.0.0.2',
          user_agent: 'Firefox',
          latitude: null,
          longitude: null,
          location_name: null,
          is_claimed: 0,
          is_first_hand: 0,
          source_info: null,
          scan_number: 2,
          created_at: new Date(),
        },
      ]);

      const result = await getTagScans(1);

      expect(result).not.toBeNull();
      expect(result?.totalScans).toBe(2);
      expect(result?.uniqueScanners).toBe(2);
      expect(result?.claimedCount).toBe(1);
      expect(result?.firstHandCount).toBe(1);
      expect(result?.secondHandCount).toBe(1);
    });
  });

  describe('deleteTag', () => {
    it('should handle database errors during deletion', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({ is_stamped: 0 });
      mockPrismaClient.tag.delete.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await deleteTag(1);

      expect(result).toEqual({ error: 'Failed to delete tag' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Delete tag error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('toggleTagPublishStatus', () => {
    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        publish_status: 1,
      });
      mockPrismaClient.tag.update.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await toggleTagPublishStatus(1);

      expect(result).toEqual({ error: 'Failed to update tag publish status' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Toggle tag publish status error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('updateChainStatus', () => {
    it('should handle blockchain errors', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        code: 'TAG-123',
        is_stamped: 1,
        chain_status: 0,
      });
      mockUpdateTagChainStatus.mockResolvedValue({ success: false });

      const result = await updateChainStatus(1, 1);

      expect(result).toEqual({
        error: 'Failed to update status on blockchain',
      });
    });

    it('should handle errors during update', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await updateChainStatus(1, 1);

      expect(result).toEqual({ error: 'Failed to update chain status' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Update chain status error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('revokeTagOnBlockchain', () => {
    it('should handle blockchain errors', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockResolvedValue({
        code: 'TAG-123',
        is_stamped: 1,
        chain_status: 0,
      });
      mockRevokeTagOnChain.mockResolvedValue({ success: false });

      const result = await revokeTagOnBlockchain(1, 'Test reason');

      expect(result).toEqual({ error: 'Failed to revoke tag on blockchain' });
    });

    it('should handle errors during revoke', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await revokeTagOnBlockchain(1, 'Test reason');

      expect(result).toEqual({ error: 'Failed to revoke tag' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Revoke tag error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getTagUrls', () => {
    it('should return null on error', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findUnique.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getTagUrls(1);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Get tag URLs error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getAllTagScanLocations', () => {
    it('should return stats for admin user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrismaClient.tagScan.findMany.mockResolvedValue([
        {
          id: 1,
          tag_id: 1,
          fingerprint_id: 'fp1',
          latitude: 10.5,
          longitude: 20.5,
          location_name: 'Test Location',
          is_claimed: 1,
          is_first_hand: 1,
          created_at: new Date(),
          tag: { code: 'TAG-123' },
        },
        {
          id: 2,
          tag_id: 2,
          fingerprint_id: 'fp2',
          latitude: null,
          longitude: null,
          location_name: null,
          is_claimed: 0,
          is_first_hand: 0,
          created_at: new Date(),
          tag: { code: 'TAG-456' },
        },
      ]);

      const result = await getAllTagScanLocations();

      expect(result.totalScans).toBe(2);
      expect(result.scansWithLocation).toBe(1);
      expect(result.uniqueScanners).toBe(2);
      expect(result.claimedCount).toBe(1);
      expect(result.firstHandCount).toBe(1);
      expect(result.secondHandCount).toBe(1);
      expect(result.locations.length).toBe(1);
      expect(result.locations[0]).toMatchObject({
        id: 1,
        tagId: 1,
        tagCode: 'TAG-123',
        latitude: 10.5,
        longitude: 20.5,
        locationName: 'Test Location',
        isClaimed: true,
      });
    });

    it('should return stats for brand user', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '5' })
      );
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 5 });
      mockPrismaClient.product.findMany.mockResolvedValue([
        { id: 10 },
        { id: 11 },
      ]);
      mockPrismaClient.tag.findMany.mockResolvedValue([
        { id: 1, product_ids: [10] },
        { id: 2, product_ids: [99] }, // Not in brand's products
      ]);
      mockPrismaClient.tagScan.findMany.mockResolvedValue([
        {
          id: 1,
          tag_id: 1,
          fingerprint_id: 'fp1',
          latitude: 10.5,
          longitude: 20.5,
          location_name: 'Brand Location',
          is_claimed: 1,
          is_first_hand: 1,
          created_at: new Date(),
          tag: { code: 'TAG-BRAND-123' },
        },
      ]);

      const result = await getAllTagScanLocations();

      expect(result.totalScans).toBe(1);
      expect(result.scansWithLocation).toBe(1);
      expect(result.locations[0].tagCode).toBe('TAG-BRAND-123');
    });

    it('should return empty stats when no accessible tags', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '3', role: 'brand', brandId: '7' })
      );
      mockPrismaClient.user.findUnique.mockResolvedValue({ brand_id: 7 });
      mockPrismaClient.product.findMany.mockResolvedValue([]);
      mockPrismaClient.tag.findMany.mockResolvedValue([]);

      const result = await getAllTagScanLocations();

      expect(result).toEqual({
        totalScans: 0,
        scansWithLocation: 0,
        uniqueScanners: 0,
        claimedCount: 0,
        firstHandCount: 0,
        secondHandCount: 0,
        locations: [],
      });
    });

    it('should return empty stats on error', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.tag.findMany.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getAllTagScanLocations();

      expect(result).toEqual({
        totalScans: 0,
        scansWithLocation: 0,
        uniqueScanners: 0,
        claimedCount: 0,
        firstHandCount: 0,
        secondHandCount: 0,
        locations: [],
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Get all tag scan locations error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
