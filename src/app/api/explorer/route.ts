import { NextRequest, NextResponse } from 'next/server';
import {
  getContractStats,
  fetchContractTransactions,
  fetchTransaction,
  fetchContractEvents,
  getTagDetails,
  type DecodedTransaction,
  type ContractStats,
} from '@/lib/explorer';

export type ExplorerResponse = {
  success: boolean;
  error?: string;
  stats?: ContractStats;
  transactions?: DecodedTransaction[];
  transaction?: DecodedTransaction;
  events?: Array<{
    event: string;
    blockNumber: number;
    transactionHash: string;
    args: Record<string, string>;
  }>;
  tagDetails?: {
    isValid: boolean;
    tagId: string;
    hash?: string;
    metadataURI?: string;
    status?: number;
    statusLabel?: string;
    createdAt?: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
};

/**
 * GET /api/explorer
 *
 * Query params:
 * - action: 'stats' | 'transactions' | 'transaction' | 'events' | 'tag'
 * - page: number (for transactions)
 * - pageSize: number (for transactions)
 * - txHash: string (for single transaction)
 * - tagCode: string (for tag lookup)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'stats';

  try {
    switch (action) {
      case 'stats': {
        const stats = await getContractStats();
        return NextResponse.json<ExplorerResponse>({
          success: true,
          stats,
        });
      }

      case 'transactions': {
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '25');
        const result = await fetchContractTransactions(page, pageSize);

        return NextResponse.json<ExplorerResponse>({
          success: true,
          transactions: result.transactions,
          pagination: {
            page,
            pageSize,
            hasMore: result.hasMore,
          },
        });
      }

      case 'transaction': {
        const txHash = searchParams.get('txHash');
        if (!txHash) {
          return NextResponse.json<ExplorerResponse>(
            { success: false, error: 'Transaction hash is required' },
            { status: 400 }
          );
        }

        const transaction = await fetchTransaction(txHash);
        if (!transaction) {
          return NextResponse.json<ExplorerResponse>(
            { success: false, error: 'Transaction not found' },
            { status: 404 }
          );
        }

        return NextResponse.json<ExplorerResponse>({
          success: true,
          transaction,
        });
      }

      case 'events': {
        const events = await fetchContractEvents();
        return NextResponse.json<ExplorerResponse>({
          success: true,
          events,
        });
      }

      case 'tag': {
        const tagCode = searchParams.get('tagCode');
        if (!tagCode) {
          return NextResponse.json<ExplorerResponse>(
            { success: false, error: 'Tag code is required' },
            { status: 400 }
          );
        }

        const details = await getTagDetails(tagCode);
        if (!details) {
          return NextResponse.json<ExplorerResponse>(
            { success: false, error: 'Failed to fetch tag details' },
            { status: 500 }
          );
        }

        return NextResponse.json<ExplorerResponse>({
          success: true,
          tagDetails: {
            ...details,
            createdAt: details.createdAt?.toISOString(),
          },
        });
      }

      default:
        return NextResponse.json<ExplorerResponse>(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Explorer API error:', error);
    return NextResponse.json<ExplorerResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
