'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import { completeOnboarding } from '@/lib/actions/onboarding';

export function CompleteStep() {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
      // Redirect to dashboard - the layout will check DB for onboarding status
      window.location.href = '/manage';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsCompleting(false);
    }
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <PartyPopper className="h-10 w-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Selamat! Setup Selesai</CardTitle>
        <CardDescription className="text-base">
          Anda telah berhasil mengatur brand, produk, dan tag pertama Anda.
          Sekarang Anda siap untuk melindungi produk dari pemalsuan!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-gray-50 p-4">
          <h4 className="mb-3 font-medium">Langkah Selanjutnya:</h4>
          <div className="grid gap-3 text-left text-sm sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Stamp tag ke blockchain</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Cetak QR code tag</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Tambah lebih banyak produk</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
              <span>Pantau scan & verifikasi</span>
            </div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleComplete}
          disabled={isCompleting}
          className="w-full sm:w-auto"
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengalihkan...
            </>
          ) : (
            <>
              Masuk ke Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
