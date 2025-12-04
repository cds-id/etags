import { NextRequest, NextResponse } from 'next/server';
import {
  createSupportTicket,
  getTicketsByWallet,
} from '@/lib/actions/support-tickets';
import { ethers } from 'ethers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    return NextResponse.json(
      { error: 'Invalid wallet address' },
      { status: 400 }
    );
  }

  try {
    const tickets = await getTicketsByWallet(walletAddress);
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.walletAddress || !ethers.isAddress(body.walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!body.tagId || !body.category || !body.subject || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await createSupportTicket({
      tagId: body.tagId,
      walletAddress: body.walletAddress,
      category: body.category,
      subject: body.subject,
      description: body.description,
      attachments: body.attachments,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ticketNumber: result.ticketNumber });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
