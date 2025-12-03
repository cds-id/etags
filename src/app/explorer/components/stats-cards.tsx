'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tag,
  Activity,
  Hash,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type ContractStats = NonNullable<ExplorerResponse['stats']>;

const BASESCAN_URL = 'https://sepolia.basescan.org';

type StatsCardsProps = {
  stats: ContractStats;
  copiedText: string | null;
  onCopy: (text: string) => void;
};

const truncate = (str: string, start: number = 8, end: number = 6) => {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
};

export function StatsCards({ stats, copiedText, onCopy }: StatsCardsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <Card className="border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] p-3 shadow-md shadow-[#2B4C7E]/20">
              <Tag className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#808080]">Total Tags</p>
              <p className="text-2xl font-bold text-[#0C2340]">
                {stats.totalTags}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-br from-[#1E3A5F] to-[#0C2340] p-3 shadow-md shadow-[#1E3A5F]/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#808080]">Network</p>
              <p className="text-lg font-bold text-[#0C2340]">
                {stats.network}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] p-3 shadow-md shadow-[#2B4C7E]/20">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#808080]">Chain ID</p>
              <p className="text-2xl font-bold text-[#0C2340]">
                {stats.chainId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
        <CardContent className="p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-[#808080]">Contract Address</p>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono truncate text-[#0C2340]">
                {truncate(stats.contractAddress)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-[#2B4C7E]/10"
                onClick={() => onCopy(stats.contractAddress)}
              >
                {copiedText === stats.contractAddress ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 text-[#808080]" />
                )}
              </Button>
              <a
                href={`${BASESCAN_URL}/address/${stats.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B4C7E] hover:text-[#1E3A5F]"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
