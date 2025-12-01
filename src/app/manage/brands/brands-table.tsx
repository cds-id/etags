'use client';

import { useState, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { BrandForm } from './brand-form';
import { deleteBrand, toggleBrandStatus } from '@/lib/actions/brands';

type Brand = {
  id: number;
  name: string;
  descriptions: string;
  logo_url: string | null;
  status: number;
  created_at: Date;
  updated_at: Date;
  _count: {
    products: number;
  };
};

type BrandsTableProps = {
  brands: Brand[];
};

export function BrandsTable({ brands }: BrandsTableProps) {
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteConfirm) return;
    startTransition(async () => {
      await deleteBrand(deleteConfirm.id);
      setDeleteConfirm(null);
    });
  };

  const handleToggleStatus = (brand: Brand) => {
    startTransition(async () => {
      await toggleBrandStatus(brand.id);
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                Belum ada brand
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage
                      src={brand.logo_url || undefined}
                      className="object-contain"
                    />
                    <AvatarFallback className="rounded-md">
                      {getInitials(brand.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {brand.descriptions}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{brand._count.products}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={brand.status === 1 ? 'default' : 'destructive'}
                  >
                    {brand.status === 1 ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(brand.created_at).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <span className="sr-only">Buka menu</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditBrand(brand)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(brand)}
                        disabled={isPending}
                      >
                        {brand.status === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirm(brand)}
                        disabled={brand._count.products > 0}
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <BrandForm
        open={!!editBrand}
        onOpenChange={(open) => !open && setEditBrand(null)}
        brand={editBrand}
      />

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Brand</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {deleteConfirm?.name}? Tindakan
              ini tidak dapat dibatalkan.
              {deleteConfirm && deleteConfirm._count.products > 0 && (
                <span className="mt-2 block text-destructive">
                  Brand ini memiliki {deleteConfirm._count.products} produk.
                  Hapus produk terlebih dahulu.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending || (deleteConfirm?._count.products ?? 0) > 0}
            >
              {isPending ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
