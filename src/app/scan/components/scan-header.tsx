'use client';

import { QrCode, Shield } from 'lucide-react';

export function ScanHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/30 to-violet-500/30 rounded-full blur-xl animate-pulse" />
        <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
          <QrCode className="h-10 w-10 text-white" />
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-slate-800 via-blue-800 to-violet-800 dark:from-white dark:via-blue-200 dark:to-violet-200 bg-clip-text text-transparent">
        Scan Tag Produk
      </h1>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
        Verifikasi keaslian produk Anda
      </p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Shield className="h-4 w-4 text-emerald-500" />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Dilindungi oleh Blockchain
        </span>
      </div>
    </div>
  );
}
