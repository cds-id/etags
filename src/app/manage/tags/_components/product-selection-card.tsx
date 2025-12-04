'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Package, Check } from 'lucide-react';
import type { Product, ProductMetadata } from './types';

type ProductSelectionCardProps = {
  products: Product[];
  selectedProductIds: number[];
  isStamped: boolean;
  onProductToggle: (productId: number) => void;
};

export function ProductSelectionCard({
  products,
  selectedProductIds,
  isStamped,
  onProductToggle,
}: ProductSelectionCardProps) {
  const getProductName = (product: Product) => {
    return (product.metadata as ProductMetadata)?.name || product.code;
  };

  // Group products by brand
  const productsByBrand = products.reduce(
    (acc, product) => {
      const brandName = product.brand.name;
      if (!acc[brandName]) {
        acc[brandName] = [];
      }
      acc[brandName].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Pilih Produk
        </CardTitle>
        <CardDescription>
          Pilih satu atau lebih produk untuk dihubungkan dengan tag ini.
          {selectedProductIds.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedProductIds.length} dipilih
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Tidak ada produk aktif tersedia.
            </p>
            <Button asChild className="mt-4">
              <Link href="/manage/products/new">Buat Produk</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(productsByBrand).map(
              ([brandName, brandProducts]) => (
                <div key={brandName}>
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                    {brandName}
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {brandProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(
                        product.id
                      );
                      return (
                        <label
                          key={product.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          } ${isStamped ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onProductToggle(product.id)}
                            disabled={isStamped}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {getProductName(product)}
                            </p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {product.code}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <Separator className="mt-4" />
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
