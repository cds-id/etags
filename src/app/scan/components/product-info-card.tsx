'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package } from 'lucide-react';

type ProductInfoCardProps = {
  products: Array<{
    name: string;
    brand: string;
    brandLogo?: string;
  }>;
};

export function ProductInfoCard({ products }: ProductInfoCardProps) {
  if (!products || products.length === 0) return null;

  return (
    <Card className="mb-6 border-0 bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent shadow-lg shadow-violet-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Informasi Produk</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm ml-10">
          Detail produk terdaftar
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-violet-100 dark:border-violet-900 mb-3 last:mb-0"
          >
            {product.brandLogo ? (
              <div className="h-14 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 shrink-0">
                <Image
                  src={product.brandLogo}
                  alt={product.brand}
                  width={48}
                  height={48}
                  className="h-10 w-10 object-contain"
                />
              </div>
            ) : (
              <div className="h-14 w-14 rounded-xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-violet-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-white truncate">
                {product.name}
              </p>
              <p className="text-sm text-violet-600 dark:text-violet-400">
                {product.brand}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
