import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAgentStats, getAgentContext } from './ai-agent';
import { mockAuth, createMockSession, resetAllMocks } from '@/tests/mocks';

// Mock the AI agent library
const mockGetAIAgentContext = vi.fn();
vi.mock('@/lib/ai-agent', () => ({
  getAIAgentContext: (...args: unknown[]) => mockGetAIAgentContext(...args),
}));

describe('ai-agent actions', () => {
  beforeEach(() => {
    resetAllMocks();
    mockGetAIAgentContext.mockClear();
  });

  describe('getAgentStats', () => {
    it('should return null if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getAgentStats();

      expect(result).toBeNull();
    });

    it('should return stats for authenticated admin user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const mockStats = {
        totalBrands: 10,
        totalProducts: 50,
        totalTags: 100,
        totalScans: 500,
        claimedTags: 75,
      };

      mockGetAIAgentContext.mockResolvedValue({
        userId: 1,
        role: 'admin',
        stats: mockStats,
      });

      const result = await getAgentStats();

      expect(result).toEqual(mockStats);
      expect(mockGetAIAgentContext).toHaveBeenCalledWith(1, 'admin', undefined);
    });

    it('should return stats for authenticated brand user with brandId', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '2', role: 'brand', brandId: '5' })
      );

      const mockStats = {
        totalProducts: 10,
        totalTags: 20,
        totalScans: 100,
        claimedTags: 15,
      };

      mockGetAIAgentContext.mockResolvedValue({
        userId: 2,
        role: 'brand',
        brandId: 5,
        stats: mockStats,
      });

      const result = await getAgentStats();

      expect(result).toEqual(mockStats);
      expect(mockGetAIAgentContext).toHaveBeenCalledWith(2, 'brand', 5);
    });

    it('should return null on error', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockGetAIAgentContext.mockRejectedValue(new Error('DB Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getAgentStats();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Get agent stats error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getAgentContext', () => {
    it('should return null if user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getAgentContext();

      expect(result).toBeNull();
    });

    it('should return full context for authenticated admin user', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));

      const mockContext = {
        userId: 1,
        role: 'admin' as const,
        stats: {
          totalBrands: 10,
          totalProducts: 50,
          totalTags: 100,
          totalScans: 500,
          claimedTags: 75,
        },
        recentActivity: [],
        insights: {
          topBrands: [],
          topProducts: [],
          scanTrends: [],
        },
      };

      mockGetAIAgentContext.mockResolvedValue(mockContext);

      const result = await getAgentContext();

      expect(result).toEqual(mockContext);
      expect(mockGetAIAgentContext).toHaveBeenCalledWith(1, 'admin', undefined);
    });

    it('should return full context for authenticated brand user with brandId', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ id: '3', role: 'brand', brandId: '7' })
      );

      const mockContext = {
        userId: 3,
        role: 'brand' as const,
        brandId: 7,
        stats: {
          totalProducts: 10,
          totalTags: 20,
          totalScans: 100,
          claimedTags: 15,
        },
        recentActivity: [],
        insights: {
          topProducts: [],
          scanTrends: [],
        },
      };

      mockGetAIAgentContext.mockResolvedValue(mockContext);

      const result = await getAgentContext();

      expect(result).toEqual(mockContext);
      expect(mockGetAIAgentContext).toHaveBeenCalledWith(3, 'brand', 7);
    });

    it('should handle brand user without brandId', async () => {
      mockAuth.mockResolvedValue(createMockSession({ id: '4', role: 'brand' }));

      const mockContext = {
        userId: 4,
        role: 'brand' as const,
        stats: {
          totalProducts: 0,
          totalTags: 0,
          totalScans: 0,
          claimedTags: 0,
        },
        recentActivity: [],
        insights: {},
      };

      mockGetAIAgentContext.mockResolvedValue(mockContext);

      const result = await getAgentContext();

      expect(result).toEqual(mockContext);
      expect(mockGetAIAgentContext).toHaveBeenCalledWith(4, 'brand', undefined);
    });

    it('should return null on error', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockGetAIAgentContext.mockRejectedValue(new Error('Network Error'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await getAgentContext();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Get agent context error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
