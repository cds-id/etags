'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ShieldAlert } from 'lucide-react';

type LocationDeniedCardProps = {
  onRequestLocation: () => void;
};

export function LocationDeniedCard({
  onRequestLocation,
}: LocationDeniedCardProps) {
  return (
    <Card className="mb-6 border-2 border-amber-300 bg-linear-to-br from-amber-50 via-amber-50/50 to-transparent shadow-lg shadow-amber-500/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-amber-800">
              Deteksi Penipuan Tidak Tersedia
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Tanpa izin lokasi, sistem tidak dapat mendeteksi apakah tag ini:
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>Dipindai di luar wilayah distribusi resmi (grey market)</li>
              <li>Diduplikasi atau dipalsukan</li>
              <li>Memiliki pola pemindaian mencurigakan</li>
            </ul>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-amber-400 text-amber-800 hover:bg-amber-100"
              onClick={onRequestLocation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Izinkan Lokasi Sekarang
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
