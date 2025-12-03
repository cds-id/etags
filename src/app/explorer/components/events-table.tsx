'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, ExternalLink } from 'lucide-react';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type ContractEvent = NonNullable<ExplorerResponse['events']>[0];

const BASESCAN_URL = 'https://sepolia.basescan.org';

type EventsTableProps = {
  events: ContractEvent[];
  loading: boolean;
};

const truncate = (str: string, start: number = 6, end: number = 4) => {
  if (str.length <= start + end) return str;
  return `${str.slice(0, start)}...${str.slice(-end)}`;
};

const getEventBadgeClass = (eventName: string) => {
  switch (eventName) {
    case 'TagCreated':
      return 'bg-[#2B4C7E]/10 text-[#2B4C7E] border-0';
    case 'TagRevoked':
      return 'bg-red-100 text-red-800 border-0';
    default:
      return 'bg-amber-100 text-amber-800 border-0';
  }
};

export function EventsTable({ events, loading }: EventsTableProps) {
  return (
    <Card className="border-2 border-[#2B4C7E]/20 bg-white/80 backdrop-blur-sm shadow-lg shadow-[#2B4C7E]/10">
      <CardHeader>
        <CardTitle className="text-[#0C2340]">Contract Events</CardTitle>
        <CardDescription className="text-[#808080]">
          Events emitted by the Etags contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-[#2B4C7E]" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-[#808080]">
            No events found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2B4C7E]/20">
                  <TableHead className="text-[#0C2340]">Event</TableHead>
                  <TableHead className="text-[#0C2340]">Block</TableHead>
                  <TableHead className="text-[#0C2340]">Transaction</TableHead>
                  <TableHead className="text-[#0C2340]">Arguments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, index) => (
                  <TableRow
                    key={`${event.transactionHash}-${index}`}
                    className="border-[#2B4C7E]/10 hover:bg-[#2B4C7E]/5"
                  >
                    <TableCell>
                      <Badge className={getEventBadgeClass(event.event)}>
                        {event.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#0C2340]">
                      {event.blockNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-[#2B4C7E]">
                          {truncate(event.transactionHash)}
                        </code>
                        <a
                          href={`${BASESCAN_URL}/tx/${event.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#808080] hover:text-[#2B4C7E]"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <pre className="text-xs bg-[#2B4C7E]/5 rounded-lg p-2 max-w-md overflow-x-auto border border-[#2B4C7E]/10">
                        {JSON.stringify(event.args, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
