'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function InfoCard() {
  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent shadow-lg shadow-sky-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="p-4 sm:p-5 relative">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <Info className="h-4 w-4 text-white" />
          </div>
          <div className="text-xs sm:text-sm min-w-0">
            <p className="font-semibold mb-1 text-sky-800 dark:text-sky-300">
              Tentang Verifikasi Tag
            </p>
            <p className="text-sky-700 dark:text-sky-400">
              Halaman ini menampilkan status verifikasi tag produk. Tag yang
              terverifikasi menunjukkan bahwa produk tersebut terdaftar di
              blockchain dan dapat dilacak keasliannya. Jika Anda menemukan tag
              yang dicurigai palsu, segera laporkan ke pihak berwenang.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
