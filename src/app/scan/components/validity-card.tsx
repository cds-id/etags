'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, XCircle } from 'lucide-react';
import type { ScanResponse } from '@/app/api/scan/route';

type ValidityCardProps = {
  scanResult: ScanResponse;
};

export function ValidityCard({ scanResult }: ValidityCardProps) {
  if (scanResult.isRevoked) return null;

  const isValid = scanResult.valid;

  return (
    <Card
      className={`mb-6 border-0 shadow-xl overflow-hidden relative ${
        isValid
          ? 'bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-emerald-500/10'
          : 'bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent shadow-red-500/10'
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/4 ${
          isValid ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`}
      />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full blur-lg animate-pulse ${
                isValid ? 'bg-emerald-500/30' : 'bg-red-500/30'
              }`}
            />
            <div
              className={`relative h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isValid
                  ? 'bg-linear-to-br from-emerald-500 to-green-600 shadow-emerald-500/40'
                  : 'bg-linear-to-br from-red-500 to-rose-600 shadow-red-500/40'
              }`}
            >
              {isValid ? (
                <CheckCircle2 className="h-7 w-7 text-white" />
              ) : (
                <XCircle className="h-7 w-7 text-white" />
              )}
            </div>
          </div>
          <div>
            <CardTitle
              className={`text-xl sm:text-2xl font-bold ${
                isValid
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-red-800 dark:text-red-300'
              }`}
            >
              {isValid ? 'Produk Terverifikasi' : 'Tidak Terverifikasi'}
            </CardTitle>
            <CardDescription
              className={
                isValid
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-700 dark:text-red-400'
              }
            >
              {isValid
                ? 'Tag ini terdaftar di blockchain'
                : 'Tag ini belum terdaftar atau tidak valid'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div
          className={`flex flex-wrap items-center gap-2 text-sm ${
            isValid
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span
            className={`font-mono text-xs px-2 py-1 rounded ${
              isValid
                ? 'bg-emerald-100 dark:bg-emerald-900/50'
                : 'bg-red-100 dark:bg-red-900/50'
            }`}
          >
            {scanResult.tag?.code}
          </span>
          {scanResult.tag?.chainStatusLabel && (
            <Badge
              variant={isValid ? 'default' : 'secondary'}
              className={`shadow-sm ${
                isValid
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-600 hover:bg-slate-700'
              }`}
            >
              {scanResult.tag.chainStatusLabel}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
