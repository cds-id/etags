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
import { Tag, ArrowRight, Loader2 } from 'lucide-react';
import {
  createOnboardingTag,
  type OnboardingState,
} from '@/lib/actions/onboarding';
import { type ProductOption } from './types';

type TagStepProps = {
  products: ProductOption[];
  onSuccess: () => void;
};

export function TagStep({ products, onSuccess }: TagStepProps) {
  // Initialize with first product if available
  const [selectedProduct, setSelectedProduct] = useState<string>(() =>
    products.length > 0 ? String(products[0].id) : ''
  );
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(createOnboardingTag, {});

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-600" />
          Buat Tag Pertama
        </CardTitle>
        <CardDescription>
          Tag adalah kode unik yang akan ditempelkan pada produk Anda. Tag ini
          terhubung ke blockchain untuk mencegah pemalsuan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="productId">Pilih Produk *</Label>
            <input type="hidden" name="productId" value={selectedProduct} />
            <Select
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    {product.name} ({product.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="distributorName">Nama Distributor</Label>
              <Input
                id="distributorName"
                name="distributorName"
                placeholder="Contoh: Toko Batik Jaya"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distributorLocation">Lokasi Distributor</Label>
              <Input
                id="distributorLocation"
                name="distributorLocation"
                placeholder="Contoh: Jakarta, Indonesia"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchNumber">Nomor Batch</Label>
            <Input
              id="batchNumber"
              name="batchNumber"
              placeholder="Contoh: BATCH-2024-001"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Informasi tambahan tentang tag ini..."
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="rounded-lg border bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">
              Apa yang terjadi selanjutnya?
            </h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>1. Tag akan dibuat dengan kode QR unik</li>
              <li>2. Anda bisa mencetak dan menempelkan QR ke produk</li>
              <li>3. Stamp tag ke blockchain untuk verifikasi permanen</li>
              <li>4. Pelanggan dapat scan QR untuk verifikasi keaslian</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Tag...
                </>
              ) : (
                <>
                  Buat Tag & Selesai
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
