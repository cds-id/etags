'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react';

type VerifyStatusCardProps = {
  isRevoked: boolean;
  isStamped: boolean;
  chainStatusLabel: string;
};

const CHAIN_STATUS_LABELS: Record<string, string> = {
  Created: 'Dibuat',
  Distributed: 'Didistribusikan',
  Claimed: 'Diklaim',
  Transferred: 'Ditransfer',
  Flagged: 'Ditandai',
  Revoked: 'Dicabut',
  'Not on chain': 'Belum di Blockchain',
  Unknown: 'Tidak Diketahui',
};

const getChainStatusLabel = (status?: string) =>
  status ? CHAIN_STATUS_LABELS[status] || status : undefined;

export function VerifyStatusCard({
  isRevoked,
  isStamped,
  chainStatusLabel,
}: VerifyStatusCardProps) {
  return (
    <Card
      className={`mb-6 border-0 overflow-hidden shadow-xl relative ${
        isRevoked
          ? 'bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent shadow-red-500/10'
          : isStamped
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-emerald-500/10'
            : 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-amber-500/10'
      }`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/4 ${
          isRevoked
            ? 'bg-red-500/10'
            : isStamped
              ? 'bg-emerald-500/10'
              : 'bg-amber-500/10'
        }`}
      />
      <CardContent className="p-5 sm:p-6 relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`h-14 w-14 sm:h-18 sm:w-18 rounded-2xl flex items-center justify-center shadow-lg ${
                isRevoked
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'
                  : isStamped
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
              }`}
            >
              {isRevoked ? (
                <ShieldX className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
              ) : isStamped ? (
                <ShieldCheck className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
              ) : (
                <ShieldAlert className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h2
                className={`text-xl sm:text-2xl font-bold ${
                  isRevoked
                    ? 'text-red-700'
                    : isStamped
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                }`}
              >
                {isRevoked
                  ? 'TAG DICABUT'
                  : isStamped
                    ? 'Tag Terverifikasi'
                    : 'Tag Tidak Terverifikasi'}
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1 ${
                  isRevoked
                    ? 'text-red-600/80'
                    : isStamped
                      ? 'text-emerald-600/80'
                      : 'text-amber-600/80'
                }`}
              >
                {isRevoked
                  ? 'Tag ini telah dicabut dari blockchain. Produk mungkin palsu.'
                  : isStamped
                    ? 'Tag ini terdaftar dan terverifikasi di blockchain.'
                    : 'Tag ini belum terverifikasi di blockchain.'}
              </p>
            </div>
          </div>
          <Badge
            className={`text-xs sm:text-sm px-3 py-1.5 self-start sm:self-auto shrink-0 ${
              isRevoked
                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                : isStamped
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {getChainStatusLabel(chainStatusLabel)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
