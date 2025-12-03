import { Suspense } from 'react';
import { getNFTs, getNFTStats } from '@/lib/actions/nfts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Calendar, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import {
  formatAddress,
  getTxExplorerUrl,
  getAddressExplorerUrl,
} from '@/lib/constants';

async function NFTStatsCards() {
  const stats = await getNFTStats();

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total NFT</CardTitle>
          <Sparkles className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMinted}</div>
          <p className="text-xs text-muted-foreground">
            NFT yang sudah di-mint
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mintedToday}</div>
          <p className="text-xs text-muted-foreground">NFT baru hari ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mintedThisWeek}</div>
          <p className="text-xs text-muted-foreground">NFT minggu ini</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bulan Ini</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mintedThisMonth}</div>
          <p className="text-xs text-muted-foreground">NFT bulan ini</p>
        </CardContent>
      </Card>
    </div>
  );
}

async function NFTTable() {
  const { nfts, total } = await getNFTs({ page: 1, limit: 20 });

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Belum Ada NFT</h3>
          <p className="text-muted-foreground">
            NFT akan muncul di sini ketika pengguna melakukan klaim first-hand.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>NFT Collectibles</span>
          <Badge variant="secondary">{total} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NFT</TableHead>
              <TableHead>Token ID</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfts.map((nft) => (
              <TableRow key={nft.id}>
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    {nft.imageUrl ? (
                      <img
                        src={nft.imageUrl}
                        alt={`NFT #${nft.tokenId}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono">#{nft.tokenId}</TableCell>
                <TableCell>
                  <Link
                    href={`/manage/tags/${nft.tag.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    {nft.tag.code}
                  </Link>
                </TableCell>
                <TableCell>{nft.product?.name || '-'}</TableCell>
                <TableCell>{nft.brand?.name || '-'}</TableCell>
                <TableCell>
                  <a
                    href={getAddressExplorerUrl(nft.ownerAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-600 hover:underline"
                  >
                    {formatAddress(nft.ownerAddress)}
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(nft.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/manage/nfts/${nft.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Detail
                    </Link>
                    {nft.mintTxHash && (
                      <a
                        href={getTxExplorerUrl(nft.mintTxHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Tx
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function NFTsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NFT Collectibles</h1>
        <p className="text-muted-foreground">
          Monitor dan kelola NFT collectible yang sudah di-mint
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="py-6">
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <NFTStatsCards />
      </Suspense>

      <Suspense
        fallback={
          <Card>
            <CardContent className="py-10">
              <div className="h-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        }
      >
        <NFTTable />
      </Suspense>
    </div>
  );
}
