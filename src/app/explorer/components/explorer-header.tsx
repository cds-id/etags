'use client';

import { Button } from '@/components/ui/button';
import { Blocks, RefreshCw } from 'lucide-react';

type ExplorerHeaderProps = {
  loading: boolean;
  onRefresh: () => void;
};

export function ExplorerHeader({ loading, onRefresh }: ExplorerHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-lg shadow-[#2B4C7E]/30">
            <Blocks className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0C2340]">
            Etags Explorer
          </h1>
        </div>
        <p className="text-[#808080]">
          Blockchain transaction explorer for Etags contract
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={loading}
        className="border-[#2B4C7E]/30 hover:bg-[#2B4C7E]/5 hover:border-[#2B4C7E]/50 text-[#0C2340]"
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
        />
        Refresh
      </Button>
    </div>
  );
}
