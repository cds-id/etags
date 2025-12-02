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
    <Card className="mb-6 border-0 bg-linear-to-br from-orange-500/10 via-orange-500/5 to-transparent shadow-lg shadow-orange-500/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Riwayat Scan</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm ml-10">
          {history.length} pemindaian tercatat
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3">
          {history.slice(0, 5).map((scan, index) => (
            <div
              key={index}
              className="relative border-l-2 border-orange-200 dark:border-orange-800 pl-3 sm:pl-4 pb-3 last:pb-0"
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[7px] sm:-left-[9px] top-0 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm ${
                  scan.isFirstHand === true
                    ? 'bg-linear-to-br from-emerald-500 to-green-600'
                    : scan.isFirstHand === false
                      ? 'bg-linear-to-br from-orange-500 to-amber-600'
                      : 'bg-linear-to-br from-gray-400 to-gray-500'
                }`}
              />

              <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-2.5 sm:p-3 border border-orange-100 dark:border-orange-900">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-1">
                  <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white">
                    Scan #{scan.scanNumber}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
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
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                      }`}
                    >
                      {scan.isFirstHand ? 'Tangan Pertama' : 'Second Hand'}
                    </Badge>
                  )}
                  {scan.sourceInfo && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {scan.sourceInfo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length > 5 && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            +{history.length - 5} scan lainnya
          </p>
        )}
      </CardContent>
    </Card>
  );
}
