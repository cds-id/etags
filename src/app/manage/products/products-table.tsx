'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteProduct, toggleProductStatus } from '@/lib/actions/products';
import type { ProductMetadata } from '@/lib/product-templates';
import { MoreVertical, Pencil, Power, Trash2, ImageIcon } from 'lucide-react';

type Brand = {
  id: number;
  name: string;
  logo_url?: string | null;
};

type Product = {
  id: number;
  code: string;
  metadata: unknown;
  status: number;
  brand_id: number;
  brand: Brand;
  created_at: Date;
  updated_at: Date;
};

type ProductsTableProps = {
  products: Product[];
  isAdmin?: boolean;
};

export function ProductsTable({
  products,
  isAdmin = true,
}: ProductsTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteConfirm) return;
    startTransition(async () => {
      await deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
    });
  };

  const handleToggleStatus = (product: Product) => {
    startTransition(async () => {
      await toggleProductStatus(product.id);
    });
  };

  const getProductName = (metadata: ProductMetadata) => {
    return metadata?.name || 'Produk Tanpa Nama';
  };

  const getProductImage = (metadata: ProductMetadata) => {
    return metadata?.images?.[0] || null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            {isAdmin && <TableHead>Brand</TableHead>}
            <TableHead>Harga</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isAdmin ? 8 : 7}
                className="text-center text-muted-foreground"
              >
                Belum ada produk
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const metadata = product.metadata as ProductMetadata;
              const imageUrl = getProductImage(metadata);

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={getProductName(metadata)}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.code}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/manage/products/${product.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {getProductName(metadata)}
                    </Link>
                  </TableCell>
                  {isAdmin && <TableCell>{product.brand.name}</TableCell>}
                  <TableCell>
                    {metadata.price
                      ? formatPrice(metadata.price as number)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === 1 ? 'default' : 'destructive'}
                    >
                      {product.status === 1 ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Buka menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/manage/products/${product.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(product)}
                          disabled={isPending}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {product.status === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteConfirm(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus{' '}
              {(deleteConfirm?.metadata as ProductMetadata)?.name ||
                deleteConfirm?.code}
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
