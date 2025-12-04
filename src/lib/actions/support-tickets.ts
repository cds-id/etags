'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Generate ticket number
function generateTicketNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${date}-${random}`;
}

// ============ PUBLIC/CUSTOMER ACTIONS ============

// Get NFTs owned by wallet address
export async function getNFTsByWallet(walletAddress: string) {
  const nfts = await prisma.tagNFT.findMany({
    where: { owner_address: walletAddress.toLowerCase() },
    include: {
      tag: true,
    },
  });

  // Get product details for each NFT
  const nftsWithProducts = await Promise.all(
    nfts.map(async (nft) => {
      const productIds = (nft.tag.product_ids as number[]) || [];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { brand: true },
      });
      return {
        ...nft,
        products,
      };
    })
  );

  return nftsWithProducts;
}

// Create support ticket
export async function createSupportTicket(data: {
  tagId: number;
  walletAddress: string;
  category: string;
  subject: string;
  description: string;
  attachments?: string[]; // file URLs
}) {
  // Verify wallet owns this NFT
  const nft = await prisma.tagNFT.findFirst({
    where: {
      tag_id: data.tagId,
      owner_address: data.walletAddress.toLowerCase(),
    },
    include: {
      tag: true,
    },
  });

  if (!nft) {
    return { success: false, error: 'You do not own this product NFT' };
  }

  // Get brand from product
  const productIds = (nft.tag.product_ids as number[]) || [];
  const product = await prisma.product.findFirst({
    where: { id: { in: productIds } },
  });

  if (!product) {
    return { success: false, error: 'Product not found' };
  }

  // Check if brand has active users
  const brandUser = await prisma.user.findFirst({
    where: {
      brand_id: product.brand_id,
      status: 1,
      role: 'brand',
    },
  });

  // If no brand user, assign to admin
  let assignedTo: number | null = null;
  if (!brandUser) {
    const admin = await prisma.user.findFirst({
      where: { role: 'admin', status: 1 },
    });
    assignedTo = admin?.id || null;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      ticket_number: generateTicketNumber(),
      tag_id: data.tagId,
      brand_id: product.brand_id,
      wallet_address: data.walletAddress.toLowerCase(),
      category: data.category,
      subject: data.subject,
      description: data.description,
      assigned_to: assignedTo,
      attachments: data.attachments?.length
        ? {
            create: data.attachments.map((url) => ({
              file_url: url,
              file_name: url.split('/').pop() || 'file',
              file_type: 'image',
              file_size: 0,
            })),
          }
        : undefined,
    },
  });

  return { success: true, ticketNumber: ticket.ticket_number };
}

// Get tickets for wallet
export async function getTicketsByWallet(walletAddress: string) {
  return prisma.supportTicket.findMany({
    where: { wallet_address: walletAddress.toLowerCase() },
    include: {
      tag: true,
      brand: true,
      messages: {
        orderBy: { created_at: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  });
}

// Get ticket by number (for customer)
export async function getTicketByNumber(
  ticketNumber: string,
  walletAddress: string
) {
  return prisma.supportTicket.findFirst({
    where: {
      ticket_number: ticketNumber,
      wallet_address: walletAddress.toLowerCase(),
    },
    include: {
      tag: {
        include: { nft: true },
      },
      brand: true,
      messages: {
        include: { sender: { select: { name: true, role: true } } },
        orderBy: { created_at: 'asc' },
      },
      attachments: true,
    },
  });
}

// Add message to ticket (customer)
export async function addCustomerMessage(
  ticketNumber: string,
  walletAddress: string,
  message: string
) {
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      ticket_number: ticketNumber,
      wallet_address: walletAddress.toLowerCase(),
    },
  });

  if (!ticket) {
    return { success: false, error: 'Ticket not found' };
  }

  await prisma.ticketMessage.create({
    data: {
      ticket_id: ticket.id,
      sender_type: 'customer',
      sender_address: walletAddress.toLowerCase(),
      message,
    },
  });

  // Update ticket status if it was resolved
  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: 'open' },
    });
  }

  return { success: true };
}

// ============ BRAND/ADMIN ACTIONS ============

// Get tickets for brand dashboard
export async function getBrandTickets(status?: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized', tickets: [] };
  }

  const where: {
    brand_id?: number;
    status?: string;
  } = {};

  if (session.user.role === 'brand' && session.user.brandId) {
    where.brand_id = Number(session.user.brandId);
  }
  // Admin sees all tickets

  if (status && status !== 'all') {
    where.status = status;
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      tag: true,
      brand: true,
      assignee: { select: { name: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return { success: true, tickets };
}

// Get single ticket for brand/admin
export async function getTicketForBrand(ticketId: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      tag: {
        include: { nft: true },
      },
      brand: true,
      assignee: { select: { id: true, name: true, email: true } },
      messages: {
        include: { sender: { select: { name: true, role: true } } },
        orderBy: { created_at: 'asc' },
      },
      attachments: true,
    },
  });

  if (!ticket) {
    return { success: false, error: 'Ticket not found' };
  }

  // Check access
  if (session.user.role === 'brand') {
    if (ticket.brand_id !== Number(session.user.brandId)) {
      return { success: false, error: 'Access denied' };
    }
  }

  // Get product info
  const productIds = (ticket.tag.product_ids as number[]) || [];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  return { success: true, ticket, products };
}

// Reply to ticket (brand/admin)
export async function replyToTicket(ticketId: number, message: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: 'Ticket not found' };
  }

  // Check access
  if (session.user.role === 'brand') {
    if (ticket.brand_id !== Number(session.user.brandId)) {
      return { success: false, error: 'Access denied' };
    }
  }

  await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticket_id: ticketId,
        sender_type: session.user.role,
        sender_user_id: Number(session.user.id),
        message,
      },
    }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
        assigned_to: ticket.assigned_to || Number(session.user.id),
      },
    }),
  ]);

  revalidatePath(`/manage/tickets/${ticketId}`);
  return { success: true };
}

// Update ticket status
export async function updateTicketStatus(ticketId: number, status: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return { success: false, error: 'Ticket not found' };
  }

  // Check access
  if (session.user.role === 'brand') {
    if (ticket.brand_id !== Number(session.user.brandId)) {
      return { success: false, error: 'Access denied' };
    }
  }

  const data: { status: string; resolved_at?: Date } = { status };
  if (status === 'resolved') {
    data.resolved_at = new Date();
  }

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data,
  });

  revalidatePath(`/manage/tickets/${ticketId}`);
  revalidatePath('/manage/tickets');
  return { success: true };
}

// Get ticket stats for dashboard
export async function getTicketStats() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const where: { brand_id?: number } = {};
  if (session.user.role === 'brand' && session.user.brandId) {
    where.brand_id = Number(session.user.brandId);
  }

  const [total, open, inProgress, resolved] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.count({ where: { ...where, status: 'open' } }),
    prisma.supportTicket.count({ where: { ...where, status: 'in_progress' } }),
    prisma.supportTicket.count({ where: { ...where, status: 'resolved' } }),
  ]);

  return {
    success: true,
    stats: { total, open, inProgress, resolved },
  };
}
