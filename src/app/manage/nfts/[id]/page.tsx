import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNFTById } from '@/lib/actions/nfts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Sparkles,
  Tag,
  Package,
  Building2,
  Wallet,
  Hash,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getTxExplorerUrl,
  getAddressExplorerUrl,
  getNFTExplorerUrl,
} from '@/lib/constants';
import { formatAddress } from '@/hooks/useWeb3';

interface NFTDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NFTDetailPage({ params }: NFTDetailPageProps) {
  const { id } = await params;
  const nftId = parseInt(id, 10);

  if (isNaN(nftId)) {
    notFound();
  }

  const nft = await getNFTById(nftId);

  if (!nft) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/manage/nfts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            NFT #{nft.tokenId}
          </h1>
          <p className="text-muted-foreground">Detail NFT Collectible</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* NFT Image */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              {nft.imageUrl ? (
                <img
                  src={nft.imageUrl}
                  alt={`NFT #${nft.tokenId}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* NFT Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi NFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Token ID
                </span>
                <span className="font-mono font-medium">#{nft.tokenId}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Tanggal Mint
                </span>
                <span>
                  {new Date(nft.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Owner
                </span>
                <a
                  href={getAddressExplorerUrl(nft.ownerAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-600 hover:underline flex items-center gap-1"
                >
                  {formatAddress(nft.ownerAddress)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Tag Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-500" />
                Tag Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tag Code</span>
                <Link
                  href={`/manage/tags/${nft.tag.id}/edit`}
                  className="font-mono text-blue-600 hover:underline"
                >
                  {nft.tag.code}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verify Link</span>
                <a
                  href={`/verify/${nft.tag.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Open
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Product & Brand Info */}
          {(nft.product || nft.brand) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  Product & Brand
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nft.product && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Product</span>
                    <span className="font-medium">{nft.product.name}</span>
                  </div>
                )}
                {nft.brand && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Brand
                    </span>
                    <div className="flex items-center gap-2">
                      {nft.brand.logoUrl && (
                        <img
                          src={nft.brand.logoUrl}
                          alt={nft.brand.name}
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      <span className="font-medium">{nft.brand.name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Blockchain Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blockchain Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mint Transaction */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Mint Transaction</h4>
              {nft.mintTxHash ? (
                <a
                  href={getTxExplorerUrl(nft.mintTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-600 hover:underline break-all flex items-start gap-1"
                >
                  {nft.mintTxHash}
                  <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
                </a>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>

            {/* Transfer Transaction */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Transfer Transaction</h4>
              {nft.transferTxHash ? (
                <a
                  href={getTxExplorerUrl(nft.transferTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-600 hover:underline break-all flex items-start gap-1"
                >
                  {nft.transferTxHash}
                  <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
                </a>
              ) : (
                <span className="text-muted-foreground text-sm">
                  Same as mint (minted directly to owner)
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <a
              href={getNFTExplorerUrl(nft.tokenId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            </a>
            {nft.imageUrl && (
              <a href={nft.imageUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  View Image
                </Button>
              </a>
            )}
            {nft.metadataUrl && (
              <a
                href={nft.metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  View Metadata
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
