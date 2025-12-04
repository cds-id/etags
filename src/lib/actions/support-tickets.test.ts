import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNFTsByWallet,
  createSupportTicket,
  getTicketsByWallet,
  getTicketByNumber,
  addCustomerMessage,
  getBrandTickets,
  getTicketForBrand,
  replyToTicket,
  updateTicketStatus,
  getTicketStats,
} from './support-tickets';
import {
  mockPrismaClient,
  mockAuth,
  mockRevalidatePath,
  createMockSession,
  resetAllMocks,
} from '@/tests/mocks';

describe('support-tickets actions', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getNFTsByWallet', () => {
    it('should return NFTs with products for a wallet address', async () => {
      const mockNfts = [
        {
          id: 1,
          tag_id: 1,
          owner_address: '0x123abc',
          tag: { id: 1, code: 'TAG-001', product_ids: [1, 2] },
        },
      ];
      const mockProducts = [
        { id: 1, code: 'PROD-001', brand: { id: 1, name: 'Brand A' } },
        { id: 2, code: 'PROD-002', brand: { id: 1, name: 'Brand A' } },
      ];

      mockPrismaClient.tagNFT.findMany.mockResolvedValue(mockNfts);
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      const result = await getNFTsByWallet('0x123ABC');

      expect(mockPrismaClient.tagNFT.findMany).toHaveBeenCalledWith({
        where: { owner_address: '0x123abc' },
        include: { tag: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0].products).toEqual(mockProducts);
    });

    it('should return empty array if no NFTs found', async () => {
      mockPrismaClient.tagNFT.findMany.mockResolvedValue([]);

      const result = await getNFTsByWallet('0xnonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('createSupportTicket', () => {
    const ticketData = {
      tagId: 1,
      walletAddress: '0x123ABC',
      category: 'defect',
      subject: 'Product Issue',
      description: 'My product has a defect',
    };

    it('should return error if wallet does not own the NFT', async () => {
      mockPrismaClient.tagNFT.findFirst.mockResolvedValue(null);

      const result = await createSupportTicket(ticketData);

      expect(result).toEqual({
        success: false,
        error: 'You do not own this product NFT',
      });
    });

    it('should return error if product not found', async () => {
      mockPrismaClient.tagNFT.findFirst.mockResolvedValue({
        id: 1,
        tag: { product_ids: [999] },
      });
      mockPrismaClient.product.findFirst.mockResolvedValue(null);

      const result = await createSupportTicket(ticketData);

      expect(result).toEqual({
        success: false,
        error: 'Product not found',
      });
    });

    it('should create ticket and assign to brand user if available', async () => {
      mockPrismaClient.tagNFT.findFirst.mockResolvedValue({
        id: 1,
        tag: { product_ids: [1] },
      });
      mockPrismaClient.product.findFirst.mockResolvedValue({
        id: 1,
        brand_id: 1,
      });
      mockPrismaClient.user.findFirst.mockResolvedValue({
        id: 5,
        role: 'brand',
      });
      mockPrismaClient.supportTicket.create.mockResolvedValue({
        id: 1,
        ticket_number: 'TKT-20251204-ABCD',
      });

      const result = await createSupportTicket(ticketData);

      expect(result.success).toBe(true);
      expect(result.ticketNumber).toMatch(/^TKT-/);
      expect(mockPrismaClient.supportTicket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tag_id: 1,
          brand_id: 1,
          wallet_address: '0x123abc',
          category: 'defect',
          subject: 'Product Issue',
          description: 'My product has a defect',
          assigned_to: null,
        }),
      });
    });

    it('should assign to admin if no brand user available', async () => {
      mockPrismaClient.tagNFT.findFirst.mockResolvedValue({
        id: 1,
        tag: { product_ids: [1] },
      });
      mockPrismaClient.product.findFirst.mockResolvedValue({
        id: 1,
        brand_id: 1,
      });
      mockPrismaClient.user.findFirst
        .mockResolvedValueOnce(null) // No brand user
        .mockResolvedValueOnce({ id: 1, role: 'admin' }); // Admin user
      mockPrismaClient.supportTicket.create.mockResolvedValue({
        id: 1,
        ticket_number: 'TKT-20251204-ABCD',
      });

      const result = await createSupportTicket(ticketData);

      expect(result.success).toBe(true);
      expect(mockPrismaClient.supportTicket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assigned_to: 1,
        }),
      });
    });

    it('should create ticket with attachments', async () => {
      mockPrismaClient.tagNFT.findFirst.mockResolvedValue({
        id: 1,
        tag: { product_ids: [1] },
      });
      mockPrismaClient.product.findFirst.mockResolvedValue({
        id: 1,
        brand_id: 1,
      });
      mockPrismaClient.user.findFirst.mockResolvedValue(null);
      mockPrismaClient.supportTicket.create.mockResolvedValue({
        id: 1,
        ticket_number: 'TKT-20251204-ABCD',
      });

      const result = await createSupportTicket({
        ...ticketData,
        attachments: ['https://r2.example.com/file1.jpg'],
      });

      expect(result.success).toBe(true);
      expect(mockPrismaClient.supportTicket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          attachments: {
            create: [
              {
                file_url: 'https://r2.example.com/file1.jpg',
                file_name: 'file1.jpg',
                file_type: 'image',
                file_size: 0,
              },
            ],
          },
        }),
      });
    });
  });

  describe('getTicketsByWallet', () => {
    it('should return tickets for a wallet address', async () => {
      const mockTickets = [
        {
          id: 1,
          ticket_number: 'TKT-001',
          wallet_address: '0x123abc',
          tag: { code: 'TAG-001' },
          brand: { name: 'Brand A' },
          messages: [],
        },
      ];
      mockPrismaClient.supportTicket.findMany.mockResolvedValue(mockTickets);

      const result = await getTicketsByWallet('0x123ABC');

      expect(mockPrismaClient.supportTicket.findMany).toHaveBeenCalledWith({
        where: { wallet_address: '0x123abc' },
        include: {
          tag: true,
          brand: true,
          messages: { orderBy: { created_at: 'asc' } },
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockTickets);
    });
  });

  describe('getTicketByNumber', () => {
    it('should return ticket for owner', async () => {
      const mockTicket = {
        id: 1,
        ticket_number: 'TKT-001',
        wallet_address: '0x123abc',
      };
      mockPrismaClient.supportTicket.findFirst.mockResolvedValue(mockTicket);

      const result = await getTicketByNumber('TKT-001', '0x123ABC');

      expect(mockPrismaClient.supportTicket.findFirst).toHaveBeenCalledWith({
        where: {
          ticket_number: 'TKT-001',
          wallet_address: '0x123abc',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTicket);
    });

    it('should return null if ticket not found or not owned', async () => {
      mockPrismaClient.supportTicket.findFirst.mockResolvedValue(null);

      const result = await getTicketByNumber('TKT-999', '0xwrongwallet');

      expect(result).toBeNull();
    });
  });

  describe('addCustomerMessage', () => {
    it('should return error if ticket not found', async () => {
      mockPrismaClient.supportTicket.findFirst.mockResolvedValue(null);

      const result = await addCustomerMessage('TKT-999', '0x123ABC', 'Hello');

      expect(result).toEqual({
        success: false,
        error: 'Ticket not found',
      });
    });

    it('should add message to ticket', async () => {
      mockPrismaClient.supportTicket.findFirst.mockResolvedValue({
        id: 1,
        status: 'in_progress',
      });
      mockPrismaClient.ticketMessage.create.mockResolvedValue({ id: 1 });

      const result = await addCustomerMessage(
        'TKT-001',
        '0x123ABC',
        'Hello support'
      );

      expect(result).toEqual({ success: true });
      expect(mockPrismaClient.ticketMessage.create).toHaveBeenCalledWith({
        data: {
          ticket_id: 1,
          sender_type: 'customer',
          sender_address: '0x123abc',
          message: 'Hello support',
        },
      });
    });

    it('should reopen ticket if it was resolved', async () => {
      mockPrismaClient.supportTicket.findFirst.mockResolvedValue({
        id: 1,
        status: 'resolved',
      });
      mockPrismaClient.ticketMessage.create.mockResolvedValue({ id: 1 });
      mockPrismaClient.supportTicket.update.mockResolvedValue({ id: 1 });

      await addCustomerMessage('TKT-001', '0x123ABC', 'Need more help');

      expect(mockPrismaClient.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'open' },
      });
    });
  });

  describe('getBrandTickets', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getBrandTickets();

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
        tickets: [],
      });
    });

    it('should return all tickets for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockTickets = [
        { id: 1, brand_id: 1 },
        { id: 2, brand_id: 2 },
      ];
      mockPrismaClient.supportTicket.findMany.mockResolvedValue(mockTickets);

      const result = await getBrandTickets();

      expect(result.success).toBe(true);
      expect(result.tickets).toEqual(mockTickets);
      expect(mockPrismaClient.supportTicket.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return only brand tickets for brand user', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ role: 'brand', brandId: '5' })
      );
      mockPrismaClient.supportTicket.findMany.mockResolvedValue([]);

      await getBrandTickets();

      expect(mockPrismaClient.supportTicket.findMany).toHaveBeenCalledWith({
        where: { brand_id: 5 },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });

    it('should filter by status', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.findMany.mockResolvedValue([]);

      await getBrandTickets('open');

      expect(mockPrismaClient.supportTicket.findMany).toHaveBeenCalledWith({
        where: { status: 'open' },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getTicketForBrand', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getTicketForBrand(1);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return error if ticket not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue(null);

      const result = await getTicketForBrand(999);

      expect(result).toEqual({
        success: false,
        error: 'Ticket not found',
      });
    });

    it('should return error if brand user tries to access other brand ticket', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ role: 'brand', brandId: '5' })
      );
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 10, // Different brand
        tag: { product_ids: [] },
      });

      const result = await getTicketForBrand(1);

      expect(result).toEqual({
        success: false,
        error: 'Access denied',
      });
    });

    it('should return ticket with products for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      const mockTicket = {
        id: 1,
        brand_id: 1,
        tag: { product_ids: [1, 2] },
      };
      const mockProducts = [
        { id: 1, code: 'PROD-001' },
        { id: 2, code: 'PROD-002' },
      ];
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      const result = await getTicketForBrand(1);

      expect(result.success).toBe(true);
      expect(result.ticket).toEqual(mockTicket);
      expect(result.products).toEqual(mockProducts);
    });
  });

  describe('replyToTicket', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await replyToTicket(1, 'Reply message');

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return error if ticket not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue(null);

      const result = await replyToTicket(999, 'Reply');

      expect(result).toEqual({
        success: false,
        error: 'Ticket not found',
      });
    });

    it('should return error if brand user tries to reply to other brand ticket', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ role: 'brand', brandId: '5' })
      );
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 10,
      });

      const result = await replyToTicket(1, 'Reply');

      expect(result).toEqual({
        success: false,
        error: 'Access denied',
      });
    });

    it('should create reply and update ticket status', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin', id: '1' }));
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 1,
        status: 'open',
        assigned_to: null,
      });
      mockPrismaClient.$transaction.mockResolvedValue([
        { id: 1 },
        { id: 1, status: 'in_progress' },
      ]);

      const result = await replyToTicket(1, 'We are looking into this');

      expect(result).toEqual({ success: true });
      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith('/manage/tickets/1');
    });
  });

  describe('updateTicketStatus', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await updateTicketStatus(1, 'resolved');

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return error if ticket not found', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue(null);

      const result = await updateTicketStatus(999, 'resolved');

      expect(result).toEqual({
        success: false,
        error: 'Ticket not found',
      });
    });

    it('should update ticket status', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 1,
      });
      mockPrismaClient.supportTicket.update.mockResolvedValue({ id: 1 });

      const result = await updateTicketStatus(1, 'in_progress');

      expect(result).toEqual({ success: true });
      expect(mockPrismaClient.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'in_progress' },
      });
    });

    it('should set resolved_at when marking as resolved', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.findUnique.mockResolvedValue({
        id: 1,
        brand_id: 1,
      });
      mockPrismaClient.supportTicket.update.mockResolvedValue({ id: 1 });

      await updateTicketStatus(1, 'resolved');

      expect(mockPrismaClient.supportTicket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'resolved',
          resolved_at: expect.any(Date),
        },
      });
    });
  });

  describe('getTicketStats', () => {
    it('should return error if not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getTicketStats();

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return ticket statistics for admin', async () => {
      mockAuth.mockResolvedValue(createMockSession({ role: 'admin' }));
      mockPrismaClient.supportTicket.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30) // open
        .mockResolvedValueOnce(40) // in_progress
        .mockResolvedValueOnce(30); // resolved

      const result = await getTicketStats();

      expect(result.success).toBe(true);
      expect(result.stats).toEqual({
        total: 100,
        open: 30,
        inProgress: 40,
        resolved: 30,
      });
    });

    it('should filter by brand for brand user', async () => {
      mockAuth.mockResolvedValue(
        createMockSession({ role: 'brand', brandId: '5' })
      );
      mockPrismaClient.supportTicket.count.mockResolvedValue(10);

      await getTicketStats();

      expect(mockPrismaClient.supportTicket.count).toHaveBeenCalledWith({
        where: { brand_id: 5 },
      });
    });
  });
});
