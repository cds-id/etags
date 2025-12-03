'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type Transaction = NonNullable<ExplorerResponse['transactions']>[0];

const BASESCAN_URL = 'https://sepolia.basescan.org';

type TransactionsTableProps = {
  transactions: Transaction[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  copiedText: string | null;
  onCopy: (text: string) => void;
  onPageChange: (page: number) => void;
};

const truncate = (str: string, start: number = 6, end: number = 4) => {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('id-ID');
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

export function TransactionsTable({
  transactions,
  loading,
  page,
  hasMore,
  copiedText,
  onCopy,
  onPageChange,
}: TransactionsTableProps) {
  const router = useRouter();

  return (
    <Card className="border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
      <CardHeader>
        <CardTitle className="text-[#0C2340]">Recent Transactions</CardTitle>
        <CardDescription className="text-[#808080]">
          Transactions interacting with the Etags contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[#2B4C7E]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-[#808080]">
            No transactions found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2B4C7E]/20">
                    <TableHead className="text-[#0C2340]">Tx Hash</TableHead>
                    <TableHead className="text-[#0C2340]">Block</TableHead>
                    <TableHead className="text-[#0C2340]">Method</TableHead>
                    <TableHead className="text-[#0C2340]">From</TableHead>
                    <TableHead className="text-[#0C2340]">Status</TableHead>
                    <TableHead className="text-[#0C2340]">Time</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow
                      key={tx.hash}
                      className="border-[#2B4C7E]/10 hover:bg-[#2B4C7E]/5"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-[#2B4C7E]">
                            {truncate(tx.hash)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-[#2B4C7E]/10"
                            onClick={() => onCopy(tx.hash)}
                          >
                            {copiedText === tx.hash ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-[#808080]" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#0C2340]">
                        {tx.blockNumber}
                      </TableCell>
                      <TableCell>
                        <Badge className={getMethodBadge(tx.methodName)}>
                          {tx.methodName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono text-[#808080]">
                          {truncate(tx.from)}
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-xs text-[#808080]">
                        {formatTime(tx.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/explorer/tx/${tx.hash}`)
                            }
                            className="text-[#2B4C7E] hover:bg-[#2B4C7E]/10"
                          >
                            Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-[#2B4C7E]/10"
                            asChild
                          >
                            <a
                              href={`${BASESCAN_URL}/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 text-[#2B4C7E]" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-[#808080]">Page {page}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => onPageChange(page - 1)}
                  className="border-[#2B4C7E]/30 hover:bg-[#2B4C7E]/5 hover:border-[#2B4C7E]/50 text-[#0C2340]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => onPageChange(page + 1)}
                  className="border-[#2B4C7E]/30 hover:bg-[#2B4C7E]/5 hover:border-[#2B4C7E]/50 text-[#0C2340]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
