'use client';

import { useState, useTransition } from 'react';
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
import { TagForm } from './tag-form';
import { deleteTag, toggleTagPublishStatus } from '@/lib/actions/tags';
import { getChainStatusLabel } from '@/lib/constants';
import type { ProductMetadata } from '@/lib/product-templates';

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
  allProducts: Product[];
};

export function TagsTable({ tags, allProducts }: TagsTableProps) {
  const [editTag, setEditTag] = useState<Tag | null>(null);
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
    return `${firstName} +${products.length - 1} more`;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Publish</TableHead>
            <TableHead>Blockchain</TableHead>
            <TableHead>Chain Status</TableHead>
            <TableHead>Created</TableHead>
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
                No tags found
              </TableCell>
            </TableRow>
          ) : (
            tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-mono text-sm">{tag.code}</TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <span className="truncate">
                      {getProductNames(tag.products)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {tag.products.length} product(s)
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tag.publish_status === 1 ? 'default' : 'secondary'}
                  >
                    {tag.publish_status === 1 ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={tag.is_stamped === 1 ? 'default' : 'outline'}>
                    {tag.is_stamped === 1 ? 'Stamped' : 'Not Stamped'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {getChainStatusLabel(tag.chain_status)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(tag.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <span className="sr-only">Open menu</span>
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
                      <DropdownMenuItem onClick={() => setEditTag(tag)}>
                        {tag.is_stamped === 1 ? 'View / Edit Status' : 'Edit'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleTogglePublish(tag)}
                        disabled={isPending}
                      >
                        {tag.publish_status === 1 ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      {tag.is_stamped !== 1 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteConfirm(tag)}
                          >
                            Delete
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

      <TagForm
        open={!!editTag}
        onOpenChange={(open) => !open && setEditTag(null)}
        tag={editTag}
        products={allProducts}
      />

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete tag {deleteConfirm?.code}? This
              action cannot be undone.
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
