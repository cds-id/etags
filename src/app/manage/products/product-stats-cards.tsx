import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package, CheckCircle, Tag, PackageX } from 'lucide-react';

type ProductStatsCardsProps = {
  stats: {
    totalProducts: number;
    activeProducts: number;
    productsWithTags: number;
    productsWithoutTags: number;
  };
};

export function ProductStatsCards({ stats }: ProductStatsCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Produk
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Package className="h-[18px] w-[18px] text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.totalProducts}
          </div>
          <CardDescription className="text-xs mt-1">
            Produk terdaftar
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Produk Aktif
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <CheckCircle className="h-[18px] w-[18px] text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.activeProducts}
          </div>
          <CardDescription className="text-xs mt-1">
            Produk aktif
          </CardDescription>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dengan Tag
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Tag className="h-[18px] w-[18px] text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {stats.productsWithTags}
          </div>
          <CardDescription className="text-xs mt-1">Punya tag</CardDescription>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-rose-500/10 via-rose-500/5 to-transparent gap-0 py-0">
        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tanpa Tag
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <PackageX className="h-[18px] w-[18px] text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {stats.productsWithoutTags}
          </div>
          <CardDescription className="text-xs mt-1">
            Belum ada tag
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
