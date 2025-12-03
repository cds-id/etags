'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Scan, Loader2 } from 'lucide-react';

type ScannerCardProps = {
  scanning: boolean;
  fingerprintId: string | null;
  onStartScanner: () => void;
  onStopScanner: () => void;
};

export function ScannerCard({
  scanning,
  fingerprintId,
  onStartScanner,
  onStopScanner,
}: ScannerCardProps) {
  return (
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-linear-to-br from-white via-[#2B4C7E]/5 to-[#1E3A5F]/5 shadow-xl shadow-[#2B4C7E]/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2B4C7E]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1E3A5F]/10 rounded-full translate-y-1/2 -translate-x-1/4" />
      <CardContent className="p-4 sm:p-6 relative">
        {/* Scanner Container */}
        <div
          id="qr-reader"
          className={`overflow-hidden rounded-2xl bg-[#0C2340] shadow-inner ${scanning ? 'min-h-[280px] sm:min-h-[320px]' : 'hidden'}`}
        />

        {/* Scanning indicator overlay */}
        {scanning && (
          <div className="mt-4 flex flex-col items-center">
            <div className="flex items-center gap-2 text-[#2B4C7E]">
              <Scan className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Mencari QR Code...</span>
            </div>
            <Button
              onClick={onStopScanner}
              variant="outline"
              className="mt-4 w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
            >
              Batal
            </Button>
          </div>
        )}

        {/* Idle state */}
        {!scanning && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#2B4C7E]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-linear-to-br from-[#2B4C7E]/10 to-[#1E3A5F]/10 flex items-center justify-center border-4 border-dashed border-[#2B4C7E]/40">
                <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-[#2B4C7E]" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#0C2340] mb-2">
              Siap untuk Scan
            </h3>
            <p className="mb-6 text-center text-sm text-[#808080] max-w-xs">
              Arahkan kamera ke QR code pada tag produk untuk memverifikasi
              keaslian
            </p>
            <Button
              onClick={onStartScanner}
              disabled={!fingerprintId}
              size="lg"
              className="gap-2 bg-linear-to-r from-[#2B4C7E] to-[#1E3A5F] hover:from-[#1E3A5F] hover:to-[#0C2340] shadow-lg shadow-[#2B4C7E]/30 text-white px-8"
            >
              {!fingerprintId ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5" />
                  Mulai Scan
                </>
              )}
            </Button>
            <p className="mt-4 text-xs text-[#808080]">
              Pastikan izin kamera telah diaktifkan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
