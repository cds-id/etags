'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Globe } from 'lucide-react';

type DistributionInfoCardProps = {
  distribution?: {
    region?: string;
    country?: string;
    channel?: string;
    intendedMarket?: string;
  };
};

const COUNTRY_LABELS: Record<string, string> = {
  ID: 'Indonesia',
  SG: 'Singapura',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  PH: 'Filipina',
  GLOBAL: 'Global (Seluruh Dunia)',
};

const CHANNEL_LABELS: Record<string, string> = {
  official_store: 'Toko Resmi',
  authorized_retailer: 'Retailer Resmi',
  online_marketplace: 'Marketplace Online',
  distributor: 'Distributor',
  direct_sales: 'Penjualan Langsung',
};

const MARKET_LABELS: Record<string, string> = {
  domestic: 'Domestik',
  export: 'Ekspor',
  global: 'Global',
  southeast_asia: 'Asia Tenggara',
};

const getCountryLabel = (code?: string) =>
  code ? COUNTRY_LABELS[code] || code : undefined;
const getChannelLabel = (code?: string) =>
  code ? CHANNEL_LABELS[code] || code : undefined;
const getMarketLabel = (code?: string) =>
  code ? MARKET_LABELS[code] || code : undefined;

export function DistributionInfoCard({
  distribution,
}: DistributionInfoCardProps) {
  if (
    !distribution ||
    (!distribution.country && !distribution.region && !distribution.channel)
  ) {
    return null;
  }

  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-lg shadow-blue-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Informasi Distribusi</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm ml-10">
          Wilayah distribusi resmi produk ini
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {distribution.country && (
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-muted-foreground">Negara</p>
              <p className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-300">
                {getCountryLabel(distribution.country)}
              </p>
            </div>
          )}
          {distribution.region && (
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-muted-foreground">Wilayah</p>
              <p className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-300">
                {distribution.region}
              </p>
            </div>
          )}
          {distribution.channel && (
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-muted-foreground">Channel</p>
              <p className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-300">
                {getChannelLabel(distribution.channel)}
              </p>
            </div>
          )}
          {distribution.intendedMarket && (
            <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-muted-foreground">Pasar</p>
              <p className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-300">
                {getMarketLabel(distribution.intendedMarket)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
