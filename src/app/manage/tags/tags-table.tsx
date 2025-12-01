'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
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
import { deleteTag, toggleTagPublishStatus } from '@/lib/actions/tags';
import { getChainStatusLabel } from '@/lib/constants';
import type { ProductMetadata } from '@/lib/product-templates';
import { MoreVertical, Pencil, Eye, Trash2, Send } from 'lucide-react';

type Product = {
  id: number;
  code: string;
  metadata: unknown;
  brand: {
    id: number;
    name: string;
  };
};

type Tag = {
  id: number;
  code: string;
  product_ids: unknown;
  metadata: unknown;
  is_stamped: number;
  hash_tx: string | null;
  publish_status: number;
  chain_status: number | null;
  created_at: Date;
  updated_at: Date;
  products: Product[];
};

type TagsTableProps = {
  tags: Tag[];
};

export function TagsTable({ tags }: TagsTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<Tag | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!deleteConfirm) return;
    startTransition(async () => {
      await deleteTag(deleteConfirm.id);
      setDeleteConfirm(null);
    });
  };

  const handleTogglePublish = (tag: Tag) => {
    startTransition(async () => {
      await toggleTagPublishStatus(tag.id);
    });
  };

  const getProductNames = (products: Product[]) => {
    if (products.length === 0) return '-';
    if (products.length === 1) {
      return (
        (products[0].metadata as ProductMetadata)?.name || products[0].code
      );
    }
    const firstName =
      (products[0].metadata as ProductMetadata)?.name || products[0].code;
    return `${firstName} +${products.length - 1} lainnya`;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Publikasi</TableHead>
            <TableHead>Blockchain</TableHead>
            <TableHead>Status Chain</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                Belum ada tag
              </TableCell>
            </TableRow>
          ) : (
            tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell>
                  <Link
                    href={`/manage/tags/${tag.id}/edit`}
                    className="font-mono text-sm hover:underline"
                  >
                    {tag.code}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <span className="truncate">
                      {getProductNames(tag.products)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {tag.products.length} produk
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tag.publish_status === 1 ? 'default' : 'secondary'}
                  >
                    {tag.publish_status === 1 ? 'Dipublikasi' : 'Draf'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={tag.is_stamped === 1 ? 'default' : 'outline'}>
                    {tag.is_stamped === 1 ? 'Tercap' : 'Belum Tercap'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {getChainStatusLabel(tag.chain_status)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(tag.created_at).toLocaleDateString('id-ID')}
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
                        <Link href={`/manage/tags/${tag.id}/edit`}>
                          {tag.is_stamped === 1 ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat / Edit Status
                            </>
                          ) : (
                            <>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(tag)}
                        disabled={isPending}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {tag.publish_status === 1
                          ? 'Batalkan Publikasi'
                          : 'Publikasikan'}
                      </DropdownMenuItem>
                      {tag.is_stamped !== 1 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteConfirm(tag)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Tag</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus tag {deleteConfirm?.code}?
              Tindakan ini tidak dapat dibatalkan.
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
