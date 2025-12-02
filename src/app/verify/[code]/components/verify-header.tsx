'use client';

import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';

type VerifyHeaderProps = {
  code: string;
  loading: boolean;
  onRefresh: () => void;
};

export function VerifyHeader({ code, loading, onRefresh }: VerifyHeaderProps) {
  return (
    <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Verifikasi Tag
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate mt-1 ml-10 sm:ml-11">
              {code}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="w-full sm:w-auto hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
