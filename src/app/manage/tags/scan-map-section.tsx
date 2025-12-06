'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLocationMap } from '@/components/maps/scan-location-map';
import { Map } from 'lucide-react';
import type { ScanLocationPoint } from '@/lib/actions/tags';

type ScanMapSectionProps = {
  locations: ScanLocationPoint[];
  accessToken: string;
};

export function ScanMapSection({
  locations,
  accessToken,
}: ScanMapSectionProps) {
  if (!accessToken) {
    return (
      <Card className="relative overflow-hidden border-0 bg-linear-to-br from-slate-500/10 via-slate-500/5 to-transparent">
        <CardHeader className="flex flex-row items-center gap-3 px-5 pt-5 pb-3">
          <div className="h-10 w-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
            <Map className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-700 dark:text-slate-300">
              Peta Distribusi Scan
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="h-[400px] rounded-lg bg-muted/50 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Mapbox token belum dikonfigurasi
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-linear-to-br from-indigo-500/10 via-indigo-500/5 to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="flex flex-row items-center gap-3 px-5 pt-5 pb-3">
        <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <Map className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <CardTitle className="text-lg text-indigo-700 dark:text-indigo-300">
            Peta Distribusi Scan
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {locations.length > 0
              ? `${locations.length} lokasi scan tercatat`
              : 'Belum ada data lokasi'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {locations.length > 0 ? (
          <ScanLocationMap
            locations={locations}
            accessToken={accessToken}
            className="h-[400px] rounded-lg overflow-hidden"
          />
        ) : (
          <div className="h-[400px] rounded-lg bg-muted/50 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Belum ada data lokasi scan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
