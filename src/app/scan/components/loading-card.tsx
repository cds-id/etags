'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Shield } from 'lucide-react';

export function LoadingCard() {
  return (
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-linear-to-br from-[#2B4C7E]/10 via-[#2B4C7E]/5 to-transparent shadow-xl shadow-[#2B4C7E]/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2B4C7E]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="flex flex-col items-center justify-center py-12 relative">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-[#2B4C7E]/30 rounded-full blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-lg shadow-[#2B4C7E]/30">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
        <p className="text-base font-medium text-[#0C2340]">
          Memproses scan...
        </p>
        <div className="flex items-center gap-2 mt-2 text-[#808080]">
          <Shield className="h-4 w-4" />
          <span className="text-xs">Memverifikasi di blockchain</span>
        </div>
      </CardContent>
    </Card>
  );
}
