'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scan, Users, MapPin, Calendar } from 'lucide-react';

type ScanStatisticsCardProps = {
  scanStats: {
    totalScans: number;
    uniqueScanners: number;
    firstScanAt?: string;
    lastScanAt?: string;
    scanLocations: string[];
  };
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function ScanStatisticsCard({ scanStats }: ScanStatisticsCardProps) {
  return (
    <Card className="mb-6 border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-lg shadow-emerald-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Scan className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Statistik Pemindaian</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 text-center border border-emerald-100 dark:border-emerald-900">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-md shadow-blue-500/20">
              <Scan className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {scanStats.totalScans}
            </p>
            <p className="text-xs text-muted-foreground">Total Scan</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 text-center border border-emerald-100 dark:border-emerald-900">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-2 shadow-md shadow-purple-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {scanStats.uniqueScanners}
            </p>
            <p className="text-xs text-muted-foreground">Pemindai Unik</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 text-center border border-emerald-100 dark:border-emerald-900">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto mb-2 shadow-md shadow-rose-500/20">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              {scanStats.scanLocations.length}
            </p>
            <p className="text-xs text-muted-foreground">Lokasi Berbeda</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 text-center border border-emerald-100 dark:border-emerald-900">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs sm:text-sm font-medium leading-tight text-slate-800 dark:text-white">
              {scanStats.lastScanAt ? formatTime(scanStats.lastScanAt) : '-'}
            </p>
            <p className="text-xs text-muted-foreground">Scan Terakhir</p>
          </div>
        </div>

        {/* Scan Locations */}
        {scanStats.scanLocations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-200/50">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Lokasi Pemindaian:
            </p>
            <div className="flex flex-wrap gap-2">
              {scanStats.scanLocations.slice(0, 5).map((location, index) => (
                <Badge
                  key={index}
                  className="text-xs max-w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300"
                >
                  <MapPin className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">
                    {location.length > 30
                      ? location.substring(0, 30) + '...'
                      : location}
                  </span>
                </Badge>
              ))}
              {scanStats.scanLocations.length > 5 && (
                <Badge
                  variant="outline"
                  className="text-xs border-emerald-300 text-emerald-600"
                >
                  +{scanStats.scanLocations.length - 5} lainnya
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
