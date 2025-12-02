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
import { ImageIcon } from 'lucide-react';

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
    <Card className="relative overflow-hidden border-0 bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-violet-700 dark:text-violet-300">
              Logo Brand
            </CardTitle>
            <CardDescription className="text-xs">
              Unggah logo brand Anda
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-start gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-violet-200/50 dark:border-violet-800/50 bg-violet-500/5">
            {preview ? (
              preview.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt={brand.name}
                  className="h-full w-full rounded-xl object-contain p-2"
                />
              ) : (
                <Image
                  src={preview}
                  alt={brand.name}
                  width={96}
                  height={96}
                  className="h-full w-full rounded-xl object-contain p-2"
                />
              )
            ) : (
              <span className="text-2xl font-semibold text-violet-400 dark:text-violet-500">
                {getInitials(brand.name)}
              </span>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-sm font-medium">
                  Unggah logo baru
                </Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="bg-background/50 border-violet-200/50 dark:border-violet-800/50"
                />
                <p className="text-xs text-muted-foreground">
                  Format yang diterima: JPEG, PNG, WebP, SVG (maks 5MB)
                </p>
              </div>
              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              {state.success && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {state.message}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500"
                >
                  {isPending ? 'Mengunggah...' : 'Unggah'}
                </Button>
                {(brand.logo_url || preview) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemove}
                    disabled={isPendingRemove}
                    className="border-violet-200/50 dark:border-violet-800/50"
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
