'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, MapPin, Smartphone, Globe } from 'lucide-react';
import type { TagScansResult } from './types';

type ScanHistoryCardProps = {
  tagScans: TagScansResult;
};

export function ScanHistoryCard({ tagScans }: ScanHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Pemindaian
        </CardTitle>
        <CardDescription>
          Catatan semua pemindaian untuk tag ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{tagScans.totalScans}</p>
            <p className="text-xs text-muted-foreground">Total Pemindaian</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold">{tagScans.uniqueScanners}</p>
            <p className="text-xs text-muted-foreground">Perangkat Unik</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {tagScans.firstHandCount}
            </p>
            <p className="text-xs text-muted-foreground">Tangan Pertama</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {tagScans.secondHandCount}
            </p>
            <p className="text-xs text-muted-foreground">Tangan Kedua</p>
          </div>
        </div>

        {/* Scan Timeline */}
        {tagScans.scans.length === 0 ? (
          <div className="py-8 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Belum ada pemindaian tercatat
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {tagScans.scans.map((scan) => (
              <div
                key={scan.id}
                className="relative border-l-2 border-gray-200 pl-4 pb-4 last:pb-0"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${
                    scan.isFirstHand === true
                      ? 'bg-green-500'
                      : scan.isFirstHand === false
                        ? 'bg-orange-500'
                        : 'bg-gray-400'
                  }`}
                />

                <div className="rounded-lg border bg-card p-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{scan.scanNumber}
                      </Badge>
                      {scan.isClaimed && (
                        <Badge
                          variant={scan.isFirstHand ? 'default' : 'secondary'}
                        >
                          {scan.isFirstHand === true
                            ? 'Tangan Pertama'
                            : scan.isFirstHand === false
                              ? 'Tangan Kedua'
                              : 'Diklaim'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(scan.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Smartphone className="h-3 w-3" />
                      <span
                        className="truncate text-xs"
                        title={scan.fingerprintId}
                      >
                        Perangkat: {scan.fingerprintId.substring(0, 16)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="text-xs">IP: {scan.ipAddress}</span>
                    </div>
                    {scan.locationName && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span
                          className="truncate text-xs"
                          title={scan.locationName}
                        >
                          {scan.locationName.length > 50
                            ? scan.locationName.substring(0, 50) + '...'
                            : scan.locationName}
                        </span>
                      </div>
                    )}
                    {scan.sourceInfo && (
                      <div className="mt-2 rounded bg-muted p-2 text-xs">
                        <span className="font-medium">Sumber:</span>{' '}
                        {scan.sourceInfo}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
