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
    <Card className="mb-6 border-0 bg-linear-to-br from-white via-blue-50/30 to-violet-50/30 dark:from-slate-800 dark:via-blue-900/20 dark:to-violet-900/20 shadow-xl shadow-blue-500/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
      <CardContent className="p-4 sm:p-6 relative">
        {/* Scanner Container */}
        <div
          id="qr-reader"
          className={`overflow-hidden rounded-2xl bg-black shadow-inner ${scanning ? 'min-h-[280px] sm:min-h-[320px]' : 'hidden'}`}
        />

        {/* Scanning indicator overlay */}
        {scanning && (
          <div className="mt-4 flex flex-col items-center">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Scan className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Mencari QR Code...</span>
            </div>
            <Button
              onClick={onStopScanner}
              variant="outline"
              className="mt-4 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              Batal
            </Button>
          </div>
        )}

        {/* Idle state */}
        {!scanning && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-linear-to-br from-blue-100 to-violet-100 dark:from-blue-900/50 dark:to-violet-900/50 flex items-center justify-center border-4 border-dashed border-blue-300 dark:border-blue-700">
                <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              Siap untuk Scan
            </h3>
            <p className="mb-6 text-center text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Arahkan kamera ke QR code pada tag produk untuk memverifikasi
              keaslian
            </p>
            <Button
              onClick={onStartScanner}
              disabled={!fingerprintId}
              size="lg"
              className="gap-2 bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/30 text-white px-8"
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
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
              Pastikan izin kamera telah diaktifkan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
