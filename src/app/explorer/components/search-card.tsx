'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  RefreshCw,
  Hash,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type Transaction = NonNullable<ExplorerResponse['transactions']>[0];
type TagDetails = NonNullable<ExplorerResponse['tagDetails']>;

type SearchCardProps = {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  searchLoading: boolean;
  searchError: string | null;
  searchResult: TagDetails | Transaction | null;
};

// Helper functions
const truncate = (str: string, start: number = 10, end: number = 8) => {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
};

const isTransaction = (
  result: TagDetails | Transaction
): result is Transaction => {
  return 'hash' in result && 'from' in result;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Success
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="bg-[#A8A8A8]/20 text-[#808080]">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
  }
};

const getMethodBadge = (methodName: string) => {
  const colors: Record<string, string> = {
    createTag: 'bg-[#2B4C7E]/10 text-[#2B4C7E] border-0',
    updateStatus: 'bg-amber-100 text-amber-800 border-0',
    revokeTag: 'bg-red-100 text-red-800 border-0',
  };
  return colors[methodName] || 'bg-[#A8A8A8]/10 text-[#808080] border-0';
};

export function SearchCard({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchLoading,
  searchError,
  searchResult,
}: SearchCardProps) {
  return (
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
      <CardContent className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#808080]" />
            <Input
              placeholder="Search by Transaction Hash (0x...) or Tag Code"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              className="pl-10 border-[#2B4C7E]/20 focus:border-[#2B4C7E]/50"
            />
          </div>
          <Button
            onClick={onSearch}
            disabled={searchLoading}
            className="bg-linear-to-r from-[#2B4C7E] to-[#1E3A5F] hover:from-[#1E3A5F] hover:to-[#0C2340] shadow-lg shadow-[#2B4C7E]/30"
          >
            {searchLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Search'
            )}
          </Button>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {searchError}
          </div>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="mt-4 rounded-xl border-2 border-[#2B4C7E]/20 bg-[#2B4C7E]/5 p-4">
            {isTransaction(searchResult) ? (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-[#0C2340]">
                  <Hash className="h-4 w-4 text-[#2B4C7E]" />
                  Transaction Details
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Hash:</span>
                    <span className="font-mono text-[#0C2340]">
                      {truncate(searchResult.hash)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Method:</span>
                    <Badge className={getMethodBadge(searchResult.methodName)}>
                      {searchResult.methodName}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Status:</span>
                    {getStatusBadge(searchResult.status)}
                  </div>
                  {searchResult.decodedInput && (
                    <div className="mt-2 pt-2 border-t border-[#2B4C7E]/20">
                      <span className="text-[#808080]">Decoded Input:</span>
                      <pre className="mt-1 rounded-xl bg-white/80 p-2 text-xs overflow-x-auto border border-[#2B4C7E]/10">
                        {JSON.stringify(searchResult.decodedInput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-[#0C2340]">
                  <Tag className="h-4 w-4 text-[#2B4C7E]" />
                  Tag Details
                </h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Tag ID:</span>
                    <span className="font-mono text-[#0C2340]">
                      {truncate(searchResult.tagId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#808080]">Valid:</span>
                    {searchResult.isValid ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-0">
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Invalid</Badge>
                    )}
                  </div>
                  {searchResult.statusLabel && (
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Status:</span>
                      <Badge className="bg-[#2B4C7E]/10 text-[#2B4C7E] border-0">
                        {searchResult.statusLabel}
                      </Badge>
                    </div>
                  )}
                  {searchResult.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-[#808080]">Created:</span>
                      <span className="text-[#0C2340]">
                        {new Date(searchResult.createdAt).toLocaleString(
                          'id-ID'
                        )}
                      </span>
                    </div>
                  )}
                  {searchResult.metadataURI && (
                    <div className="mt-2 pt-2 border-t border-[#2B4C7E]/20">
                      <span className="text-[#808080]">Metadata URI:</span>
                      <a
                        href={searchResult.metadataURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-[#2B4C7E] hover:underline text-xs break-all"
                      >
                        {searchResult.metadataURI}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
