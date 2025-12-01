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
};

export function ProductsTable({ products }: ProductsTableProps) {
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
    return metadata?.name || 'Unnamed Product';
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
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                No products found
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
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell>
                    {metadata.price
                      ? formatPrice(metadata.price as number)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === 1 ? 'default' : 'destructive'}
                    >
                      {product.status === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(product.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
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
                          {product.status === 1 ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteConfirm(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              {(deleteConfirm?.metadata as ProductMetadata)?.name ||
                deleteConfirm?.code}
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
