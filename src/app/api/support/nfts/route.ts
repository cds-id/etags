import { NextRequest, NextResponse } from 'next/server';
import { getNFTsByWallet } from '@/lib/actions/support-tickets';
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
    const nfts = await getNFTsByWallet(walletAddress);
    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NFTs' },
      { status: 500 }
    );
  }
}
