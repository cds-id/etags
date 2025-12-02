'use client';

import { useEffect, useState, useActionState } from 'react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, ArrowRight, Upload, Loader2 } from 'lucide-react';
import {
  createOnboardingProduct,
  type OnboardingState,
} from '@/lib/actions/onboarding';

type ProductStepProps = {
  brandName?: string;
  onSuccess: () => void;
};

export function ProductStep({ brandName, onSuccess }: ProductStepProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(createOnboardingProduct, {});

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
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Tambah Produk Pertama
        </CardTitle>
        <CardDescription>
          {brandName && (
            <span className="font-medium text-blue-600">{brandName}</span>
          )}{' '}
          - Daftarkan produk pertama yang ingin Anda lindungi dari pemalsuan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Kemeja Batik Premium"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" defaultValue="Umum" disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Umum">Umum</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Elektronik">Elektronik</SelectItem>
                  <SelectItem value="Makanan">Makanan & Minuman</SelectItem>
                  <SelectItem value="Kosmetik">Kosmetik</SelectItem>
                  <SelectItem value="Obat">Obat & Suplemen</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Produk *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Jelaskan detail produk, bahan, ukuran, warna, dll..."
              rows={3}
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="0"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Kode Produk</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="Contoh: BTK-001"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Foto Produk (Opsional)</Label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-24 w-24 rounded-md border object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={isPending}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    disabled={isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? 'Ganti Foto' : 'Upload Foto'}
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Format: JPEG, PNG, WebP (maks. 5MB)
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
                  Lanjut ke Tag
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
