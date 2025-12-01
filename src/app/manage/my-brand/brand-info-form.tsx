'use client';

import { useActionState, useRef } from 'react';
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
import { updateMyBrand, type MyBrandFormState } from '@/lib/actions/my-brand';

type BrandInfoFormProps = {
  brand: {
    id: number;
    name: string;
    descriptions: string;
  };
};

export function BrandInfoForm({ brand }: BrandInfoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<
    MyBrandFormState,
    FormData
  >(updateMyBrand, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Brand</CardTitle>
        <CardDescription>Perbarui detail brand Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Brand</Label>
            <Input
              id="name"
              name="name"
              defaultValue={brand.name}
              placeholder="Masukkan nama brand"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descriptions">Deskripsi</Label>
            <Textarea
              id="descriptions"
              name="descriptions"
              defaultValue={brand.descriptions}
              placeholder="Masukkan deskripsi brand"
              rows={4}
              required
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
