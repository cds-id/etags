'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  uploadMyBrandLogo,
  removeMyBrandLogo,
  type MyBrandFormState,
} from '@/lib/actions/my-brand';
import Image from 'next/image';

type BrandLogoFormProps = {
  brand: {
    id: number;
    name: string;
    logo_url: string | null;
  };
};

export function BrandLogoForm({ brand }: BrandLogoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(brand.logo_url);
  const [isPendingRemove, startTransition] = useTransition();

  const [state, formAction, isPending] = useActionState<
    MyBrandFormState,
    FormData
  >(uploadMyBrandLogo, {});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeMyBrandLogo();
      setPreview(null);
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
    <Card>
      <CardHeader>
        <CardTitle>Logo Brand</CardTitle>
        <CardDescription>Unggah logo brand Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted">
            {preview ? (
              preview.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt={brand.name}
                  className="h-full w-full rounded-lg object-contain p-2"
                />
              ) : (
                <Image
                  src={preview}
                  alt={brand.name}
                  width={96}
                  height={96}
                  className="h-full w-full rounded-lg object-contain p-2"
                />
              )
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                {getInitials(brand.name)}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Unggah logo baru</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Format yang diterima: JPEG, PNG, WebP, SVG (maks 5MB)
                </p>
              </div>
              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              {state.success && (
                <p className="text-sm text-green-600">{state.message}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Mengunggah...' : 'Unggah'}
                </Button>
                {(brand.logo_url || preview) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemove}
                    disabled={isPendingRemove}
                  >
                    {isPendingRemove ? 'Menghapus...' : 'Hapus'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
