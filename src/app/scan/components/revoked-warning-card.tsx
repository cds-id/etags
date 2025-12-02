'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, ShieldX } from 'lucide-react';
import type { ScanResponse } from '@/app/api/scan/route';

type RevokedWarningCardProps = {
  scanResult: ScanResponse;
};

export function RevokedWarningCard({ scanResult }: RevokedWarningCardProps) {
  if (!scanResult.isRevoked) return null;

  return (
    <Card className="mb-6 border-0 bg-linear-to-br from-red-500/20 via-red-500/10 to-transparent shadow-xl shadow-red-500/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/20 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-lg animate-pulse" />
            <div className="relative h-14 w-14 rounded-2xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/40">
              <ShieldX className="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-red-800 dark:text-red-300 text-xl sm:text-2xl font-bold">
              TAG DICABUT
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-400">
              Tag ini telah dicabut dari blockchain
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200 mb-1">
                Peringatan Keamanan
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                {scanResult.blockchainValidation?.revokedMessage ||
                  'Tag ini telah dicabut (revoked) dari blockchain. Produk dengan tag ini mungkin palsu, dicuri, atau tidak sah. Jangan membeli atau menggunakan produk ini.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-red-700 dark:text-red-400">
          <Shield className="h-4 w-4" />
          <span className="font-mono text-xs bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
            {scanResult.tag?.code}
          </span>
          {scanResult.tag?.chainStatusLabel && (
            <Badge variant="destructive" className="shadow-sm">
              {scanResult.tag.chainStatusLabel}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
