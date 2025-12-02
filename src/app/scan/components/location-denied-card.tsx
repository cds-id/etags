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
    <Card className="mb-4 border-orange-300 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-orange-800">
              Deteksi Penipuan Tidak Tersedia
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Tanpa izin lokasi, sistem tidak dapat mendeteksi apakah tag ini:
            </p>
            <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
              <li>Dipindai di luar wilayah distribusi resmi (grey market)</li>
              <li>Diduplikasi atau dipalsukan</li>
              <li>Memiliki pola pemindaian mencurigakan</li>
            </ul>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-orange-400 text-orange-800 hover:bg-orange-200"
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
