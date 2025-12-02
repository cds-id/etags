'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Hash, MapPin } from 'lucide-react';
import type { LocationData } from './constants';

type ScanInfoCardProps = {
  totalScans: number;
  scanNumber: number;
  location: LocationData | null;
};

export function ScanInfoCard({
  totalScans,
  scanNumber,
  location,
}: ScanInfoCardProps) {
  return (
    <Card className="mb-6 border-0 bg-linear-to-br from-cyan-500/10 via-cyan-500/5 to-transparent shadow-lg shadow-cyan-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="p-4 sm:p-5 relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-cyan-100 dark:border-cyan-900 text-center">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md shadow-cyan-500/20 mx-auto mb-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">Total Scan</p>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-700 dark:text-cyan-300">
              {totalScans}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 sm:p-4 border border-cyan-100 dark:border-cyan-900 text-center">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20 mx-auto mb-2">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-muted-foreground">Scan ke-</p>
            <p className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300">
              {scanNumber}
            </p>
          </div>
        </div>
        {location && (
          <div className="mt-4 flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-cyan-100 dark:border-cyan-900">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {location.locationName ||
                `${location.latitude}, ${location.longitude}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
