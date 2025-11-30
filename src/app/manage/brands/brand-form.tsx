'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
import {
  createBrand,
  updateBrand,
  type BrandFormState,
} from '@/lib/actions/brands';
import Image from 'next/image';

type Brand = {
  id: number;
  name: string;
  descriptions: string;
  logo_url: string | null;
  status: number;
};

type BrandFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
};

function BrandFormContent({
  brand,
  onOpenChange,
}: {
  brand?: Brand | null;
  onOpenChange: (open: boolean) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand?.logo_url || null
  );
  const [removeLogo, setRemoveLogo] = useState(false);
  const isEdit = !!brand;

  const boundUpdateBrand = brand
    ? updateBrand.bind(null, brand.id)
    : createBrand;

  const [state, formAction, isPending] = useActionState<
    BrandFormState,
    FormData
  >(boundUpdateBrand, {});

  useEffect(() => {
    if (state.success) {
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    }
  }, [state.success, onOpenChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setRemoveLogo(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setRemoveLogo(true);
    const fileInput = formRef.current?.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Brand' : 'Create Brand'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update brand details and logo.' : 'Create a new brand.'}
        </DialogDescription>
      </DialogHeader>
      <form ref={formRef} action={formAction} className="space-y-4">
        <input
          type="hidden"
          name="removeLogo"
          value={removeLogo ? 'true' : 'false'}
        />

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={brand?.name || ''}
            placeholder="Enter brand name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptions">Description</Label>
          <Textarea
            id="descriptions"
            name="descriptions"
            defaultValue={brand?.descriptions || ''}
            placeholder="Enter brand description"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          <div className="flex items-start gap-4">
            {logoPreview && (
              <div className="relative">
                {logoPreview.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-20 rounded-md border object-contain"
                  />
                ) : (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-md border object-contain"
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute -right-2 -top-2"
                  onClick={handleRemoveLogo}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
            )}
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Accepted formats: JPEG, PNG, WebP, SVG (max 5MB)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={String(brand?.status ?? 1)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <DialogFooter>
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

export function BrandForm({ open, onOpenChange, brand }: BrandFormProps) {
  // Use key to reset form state when dialog opens with different brand
  const formKey = open ? `brand-${brand?.id || 'new'}` : 'closed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {open && (
          <BrandFormContent
            key={formKey}
            brand={brand}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
