'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

type ProductInfoCardProps = {
  products: Array<{
    code: string;
    name: string;
    description?: string;
    brand: string;
    brandLogo?: string;
    images?: string[];
  }>;
};

export function ProductInfoCard({ products }: ProductInfoCardProps) {
  if (products.length === 0) return null;

  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent shadow-lg shadow-purple-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Informasi Produk</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {products.map((product, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-purple-100 dark:border-purple-900"
          >
            {product.brandLogo && (
              <Image
                src={product.brandLogo}
                alt={product.brand}
                width={64}
                height={64}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-contain bg-white p-2 shrink-0 shadow-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {product.brand}
              </p>
              {product.description && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-3">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
