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
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-linear-to-br from-[#2B4C7E]/10 via-[#2B4C7E]/5 to-transparent shadow-lg shadow-[#2B4C7E]/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2B4C7E]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="p-4 sm:p-5 relative">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/80 rounded-xl p-3 sm:p-4 border border-[#2B4C7E]/20 text-center">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-md shadow-[#2B4C7E]/20 mx-auto mb-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-[#808080]">Total Scan</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#2B4C7E]">
              {totalScans}
            </p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 sm:p-4 border border-[#2B4C7E]/20 text-center">
            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-[#1E3A5F] to-[#0C2340] flex items-center justify-center shadow-md shadow-[#1E3A5F]/20 mx-auto mb-2">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <p className="text-xs text-[#808080]">Scan ke-</p>
            <p className="text-2xl sm:text-3xl font-bold text-[#1E3A5F]">
              {scanNumber}
            </p>
          </div>
        </div>
        {location && (
          <div className="mt-4 flex items-center gap-2 bg-white/80 rounded-xl p-3 border border-[#2B4C7E]/20">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-[#808080] truncate">
              {location.locationName ||
                `${location.latitude}, ${location.longitude}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
