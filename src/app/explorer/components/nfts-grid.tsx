'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gem,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import type { PublicNFT } from '@/app/api/explorer/route';
import { BLOCKCHAIN_CONFIG } from '@/lib/constants';

interface NFTsGridProps {
  nfts: PublicNFT[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  total: number;
  copiedText: string | null;
  onCopy: (text: string) => void;
  onPageChange: (page: number) => void;
}

function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTxUrl(txHash: string): string {
  return `${BLOCKCHAIN_CONFIG.EXPLORER_URL}/tx/${txHash}`;
}

export function NFTsGrid({
  nfts,
  loading,
  page,
  hasMore,
  total,
  copiedText,
  onCopy,
  onPageChange,
}: NFTsGridProps) {
  if (loading) {
    return (
      <Card className="border-[#2B4C7E]/20">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#2B4C7E]" />
        </CardContent>
      </Card>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="border-[#2B4C7E]/20">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Gem className="h-12 w-12 text-purple-300 mb-4" />
          <h3 className="text-lg font-semibold text-[#0C2340] mb-2">
            Belum Ada NFT
          </h3>
          <p className="text-sm text-[#808080] max-w-md">
            NFT Collectible akan muncul di sini setelah pemilik pertama produk
            mengklaim koleksi digital mereka.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium text-[#0C2340]">
            {total} NFT Collectible
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <Card
            key={nft.id}
            className="border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              {nft.imageUrl ? (
                <Image
                  src={nft.imageUrl}
                  alt={`NFT #${nft.tokenId}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gem className="h-16 w-16 text-purple-300" />
                </div>
              )}

              {/* Token ID Badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                  #{nft.tokenId}
                </Badge>
              </div>

              {/* View on Explorer */}
              {nft.mintTxHash && (
                <a
                  href={getTxUrl(nft.mintTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Badge className="bg-white/90 text-[#0C2340] border-0 backdrop-blur-sm hover:bg-white cursor-pointer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    BaseScan
                  </Badge>
                </a>
              )}
            </div>

            {/* Info */}
            <CardContent className="p-4 space-y-3">
              {/* Product & Brand */}
              <div>
                {nft.productName && (
                  <p className="font-medium text-[#0C2340] truncate">
                    {nft.productName}
                  </p>
                )}
                {nft.brandName && (
                  <p className="text-sm text-purple-600">{nft.brandName}</p>
                )}
                {!nft.productName && !nft.brandName && (
                  <p className="font-medium text-[#0C2340]">
                    Etags Collectible
                  </p>
                )}
              </div>

              {/* Tag Code */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs border-[#2B4C7E]/30"
                >
                  {nft.tagCode}
                </Badge>
              </div>

              {/* Owner */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#808080]">Owner</span>
                <button
                  onClick={() => onCopy(nft.ownerAddress)}
                  className="flex items-center gap-1 font-mono text-[#0C2340] hover:text-purple-600 transition-colors"
                >
                  {formatAddress(nft.ownerAddress)}
                  {copiedText === nft.ownerAddress ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#808080]">Minted</span>
                <span className="text-[#0C2340]">
                  {formatDate(nft.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-[#808080]">
          Halaman {page} dari {Math.ceil(total / 12)}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="border-[#2B4C7E]/20 hover:bg-[#2B4C7E]/5"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
            className="border-[#2B4C7E]/20 hover:bg-[#2B4C7E]/5"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
