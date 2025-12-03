'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

type ScanHistoryCardProps = {
  history: Array<{
    scanNumber: number;
    createdAt: string;
    isFirstHand: boolean | null;
    sourceInfo?: string | null;
  }>;
};

export function ScanHistoryCard({ history }: ScanHistoryCardProps) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-linear-to-br from-[#0C2340]/10 via-[#0C2340]/5 to-transparent shadow-lg shadow-[#0C2340]/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0C2340]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#0C2340] to-[#1E3A5F] flex items-center justify-center shadow-md shadow-[#0C2340]/20">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[#0C2340]">Riwayat Scan</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm ml-10 text-[#808080]">
          {history.length} pemindaian tercatat
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3">
          {history.slice(0, 5).map((scan, index) => (
            <div
              key={index}
              className="relative border-l-2 border-[#2B4C7E]/30 pl-3 sm:pl-4 pb-3 last:pb-0"
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[7px] sm:-left-[9px] top-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm ${
                  scan.isFirstHand === true
                    ? 'bg-linear-to-br from-emerald-500 to-green-600'
                    : scan.isFirstHand === false
                      ? 'bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F]'
                      : 'bg-linear-to-br from-[#A8A8A8] to-[#808080]'
                }`}
              />

              <div className="bg-white/80 rounded-xl p-2.5 sm:p-3 border border-[#2B4C7E]/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-1">
                  <span className="text-xs sm:text-sm font-medium text-[#0C2340]">
                    Scan #{scan.scanNumber}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#808080]">
                    {new Date(scan.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {scan.isFirstHand !== null && (
                    <Badge
                      className={`text-[10px] sm:text-xs ${
                        scan.isFirstHand
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-[#2B4C7E]/10 text-[#2B4C7E] hover:bg-[#2B4C7E]/10'
                      }`}
                    >
                      {scan.isFirstHand ? 'Tangan Pertama' : 'Second Hand'}
                    </Badge>
                  )}
                  {scan.sourceInfo && (
                    <span className="text-[10px] sm:text-xs text-[#808080]">
                      {scan.sourceInfo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length > 5 && (
          <p className="text-xs text-center text-[#808080] mt-3">
            +{history.length - 5} scan lainnya
          </p>
        )}
      </CardContent>
    </Card>
  );
}
