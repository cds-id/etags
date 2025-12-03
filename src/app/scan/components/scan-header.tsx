'use client';

import { QrCode, Shield } from 'lucide-react';

export function ScanHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-linear-to-br from-[#2B4C7E]/30 to-[#1E3A5F]/30 rounded-full blur-xl animate-pulse" />
        <div className="relative h-20 w-20 rounded-2xl bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center mx-auto shadow-2xl shadow-[#2B4C7E]/30">
          <QrCode className="h-10 w-10 text-white" />
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0C2340]">
        Scan Tag Produk
      </h1>
      <p className="text-sm sm:text-base text-[#808080] mt-2">
        Verifikasi keaslian produk Anda
      </p>
      <div className="flex items-center justify-center gap-2 mt-3">
        <Shield className="h-4 w-4 text-[#2B4C7E]" />
        <span className="text-xs text-[#808080]">
          Dilindungi oleh Blockchain
        </span>
      </div>
    </div>
  );
}
