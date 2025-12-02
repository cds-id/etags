'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, ArrowRight, Upload, Loader2 } from 'lucide-react';
import {
  createOnboardingBrand,
  type OnboardingState,
} from '@/lib/actions/onboarding';

type BrandStepProps = {
  onSuccess: () => void;
};

export function BrandStep({ onSuccess }: BrandStepProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(createOnboardingBrand, {});

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Setup Brand Anda
        </CardTitle>
        <CardDescription>
          Buat profil brand untuk memulai melindungi produk Anda. Informasi ini
          akan ditampilkan saat pelanggan memverifikasi produk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nama Brand *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Contoh: Batik Nusantara"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptions">Deskripsi Brand *</Label>
            <Textarea
              id="descriptions"
              name="descriptions"
              placeholder="Ceritakan tentang brand Anda, nilai-nilai, dan keunggulan produk..."
              rows={4}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo Brand (Opsional)</Label>
            <div className="flex items-start gap-4">
              {logoPreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-20 w-20 rounded-md border object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo')?.click()}
                    disabled={isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? 'Ganti Logo' : 'Upload Logo'}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Format: JPEG, PNG, WebP, SVG (maks. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Lanjut ke Produk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
