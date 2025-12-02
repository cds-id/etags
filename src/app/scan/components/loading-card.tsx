'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Shield } from 'lucide-react';

export function LoadingCard() {
  return (
    <Card className="mb-6 border-0 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-xl shadow-blue-500/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="flex flex-col items-center justify-center py-12 relative">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
        <p className="text-base font-medium text-slate-700 dark:text-slate-200">
          Memproses scan...
        </p>
        <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
          <Shield className="h-4 w-4" />
          <span className="text-xs">Memverifikasi di blockchain</span>
        </div>
      </CardContent>
    </Card>
  );
}
