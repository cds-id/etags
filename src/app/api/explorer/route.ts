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
import { prisma } from '@/lib/db';

export interface PublicNFT {
  id: number;
  tokenId: string;
  ownerAddress: string;
  imageUrl: string;
  metadataUrl: string;
  mintTxHash: string | null;
  createdAt: string;
  tagCode: string;
  productName: string | null;
  brandName: string | null;
}

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
  nfts?: PublicNFT[];
  nftStats?: {
    totalMinted: number;
  };
  pagination?: {
    page: number;
    pageSize: number;
    hasMore: boolean;
    total?: number;
  };
};

/**
 * GET /api/explorer
 *
 * Query params:
 * - action: 'stats' | 'transactions' | 'transaction' | 'events' | 'tag' | 'nfts'
 * - page: number (for transactions/nfts)
 * - pageSize: number (for transactions/nfts)
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

      case 'nfts': {
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '12');
        const skip = (page - 1) * pageSize;

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const db = prisma as any;

          const [nfts, total] = await Promise.all([
            db.tagNFT.findMany({
              skip,
              take: pageSize,
              orderBy: { created_at: 'desc' },
              include: {
                tag: true,
              },
            }),
            db.tagNFT.count(),
          ]);

          // Map NFTs to public format with product/brand info
          const publicNfts: PublicNFT[] = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nfts.map(async (nft: any) => {
              const productIds = (nft.tag?.product_ids as number[]) || [];
              let productName: string | null = null;
              let brandName: string | null = null;

              if (productIds.length > 0) {
                const productData = await prisma.product.findFirst({
                  where: { id: { in: productIds } },
                  include: { brand: true },
                });

                if (productData) {
                  const metadata = productData.metadata as { name?: string };
                  productName = metadata.name || productData.code;
                  brandName = productData.brand.name;
                }
              }

              return {
                id: nft.id,
                tokenId: nft.token_id,
                ownerAddress: nft.owner_address,
                imageUrl: nft.image_url,
                metadataUrl: nft.metadata_url,
                mintTxHash: nft.mint_tx_hash,
                createdAt: nft.created_at.toISOString(),
                tagCode: nft.tag?.code || '',
                productName,
                brandName,
              };
            })
          );

          return NextResponse.json<ExplorerResponse>({
            success: true,
            nfts: publicNfts,
            nftStats: { totalMinted: total },
            pagination: {
              page,
              pageSize,
              hasMore: skip + pageSize < total,
              total,
            },
          });
        } catch (error) {
          // TagNFT table may not exist yet
          console.error('Error fetching NFTs:', error);
          return NextResponse.json<ExplorerResponse>({
            success: true,
            nfts: [],
            nftStats: { totalMinted: 0 },
            pagination: {
              page: 1,
              pageSize: 12,
              hasMore: false,
              total: 0,
            },
          });
        }
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
