'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { createTag, updateTag, type TagFormState } from '@/lib/actions/tags';
import type { ProductMetadata, TagMetadata } from '@/lib/product-templates';

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
  publish_status: number;
  is_stamped: number;
};

type TagFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag | null;
  products: Product[];
};

function TagFormContent({
  tag,
  products,
  onOpenChange,
}: {
  tag?: Tag | null;
  products: Product[];
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!tag;
  const isStamped = tag?.is_stamped === 1;

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(
    Array.isArray(tag?.product_ids) ? (tag.product_ids as number[]) : []
  );
  const [metadata, setMetadata] = useState<TagMetadata>(
    (tag?.metadata as TagMetadata) || {}
  );

  const boundAction = tag ? updateTag.bind(null, tag.id) : createTag;

  const [state, formAction, isPending] = useActionState<TagFormState, FormData>(
    boundAction,
    {}
  );

  useEffect(() => {
    if (state.success) {
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    }
  }, [state.success, onOpenChange]);

  const handleProductToggle = (productId: number) => {
    if (isStamped) return; // Can't modify stamped tags

    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleMetadataChange = (key: string, value: string) => {
    if (isStamped) return;
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (formData: FormData) => {
    formData.set('product_ids', JSON.stringify(selectedProductIds));
    formData.set('metadata', JSON.stringify(metadata));
    formAction(formData);
  };

  const getProductName = (product: Product) => {
    return (product.metadata as ProductMetadata)?.name || product.code;
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? isStamped
              ? 'This tag is stamped on blockchain. Only publish status can be changed.'
              : 'Update tag details and linked products.'
            : 'Create a new tag and link it to products.'}
        </DialogDescription>
      </DialogHeader>
      <form
        action={handleSubmit}
        className="max-h-[60vh] space-y-4 overflow-y-auto pr-2"
      >
        {isEdit && (
          <div className="space-y-2">
            <Label>Tag Code</Label>
            <Input value={tag?.code} disabled className="font-mono" />
          </div>
        )}

        <div className="space-y-2">
          <Label>
            Select Products <span className="text-destructive">*</span>
          </Label>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active products available. Create products first.
              </p>
            ) : (
              products.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-muted'
                    } ${isStamped ? 'cursor-not-allowed opacity-60' : ''}`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <div>
                      <p className="font-medium">{getProductName(product)}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.code} • {product.brand.name}
                      </p>
                    </div>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedProductIds.length} product(s) selected
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={metadata.notes || ''}
            onChange={(e) => handleMetadataChange('notes', e.target.value)}
            placeholder="Optional notes about this tag..."
            rows={2}
            disabled={isStamped}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number</Label>
            <Input
              id="batch_number"
              value={metadata.batch_number || ''}
              onChange={(e) =>
                handleMetadataChange('batch_number', e.target.value)
              }
              placeholder="e.g., BATCH-001"
              disabled={isStamped}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manufacture_date">Manufacture Date</Label>
            <Input
              id="manufacture_date"
              type="date"
              value={metadata.manufacture_date || ''}
              onChange={(e) =>
                handleMetadataChange('manufacture_date', e.target.value)
              }
              disabled={isStamped}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publish_status">Publish Status</Label>
          <Select
            name="publish_status"
            defaultValue={String(tag?.publish_status ?? 0)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Draft</SelectItem>
              <SelectItem value="1">Published</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only published tags are visible for public scanning
          </p>
        </div>

        {isStamped && (
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2">
              <Badge variant="default">Blockchain Stamped</Badge>
              <span className="text-sm text-muted-foreground">
                Core data is immutable
              </span>
            </div>
          </div>
        )}

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <DialogFooter className="sticky bottom-0 bg-background pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TagForm({ open, onOpenChange, tag, products }: TagFormProps) {
  const formKey = open ? `tag-${tag?.id || 'new'}` : 'closed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        {open && (
          <TagFormContent
            key={formKey}
            tag={tag}
            products={products}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
