'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  Blocks,
  Activity,
  Tag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileCode,
} from 'lucide-react';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type ContractStats = NonNullable<ExplorerResponse['stats']>;
type Transaction = NonNullable<ExplorerResponse['transactions']>[0];
type ContractEvent = NonNullable<ExplorerResponse['events']>[0];
type TagDetails = NonNullable<ExplorerResponse['tagDetails']>;

const BASESCAN_URL = 'https://sepolia.basescan.org';

export default function ExplorerPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<
    TagDetails | Transaction | null
  >(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch contract stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/explorer?action=stats');
      const data: ExplorerResponse = await response.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async (pageNum: number = 1) => {
    setTxLoading(true);
    try {
      const response = await fetch(
        `/api/explorer?action=transactions&page=${pageNum}&pageSize=25`
      );
      const data: ExplorerResponse = await response.json();
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setTxLoading(false);
    }
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const response = await fetch('/api/explorer?action=events');
      const data: ExplorerResponse = await response.json();
      if (data.success && data.events) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchTransactions(1), fetchEvents()]);
      setLoading(false);
    };
    init();
  }, [fetchStats, fetchTransactions, fetchEvents]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      // Check if it's a transaction hash (starts with 0x and is 66 chars)
      if (searchQuery.startsWith('0x') && searchQuery.length === 66) {
        const response = await fetch(
          `/api/explorer?action=transaction&txHash=${searchQuery}`
        );
        const data: ExplorerResponse = await response.json();
        if (data.success && data.transaction) {
          setSearchResult(data.transaction);
        } else {
          setSearchError('Transaction not found');
        }
      } else {
        // Assume it's a tag code
        const response = await fetch(
          `/api/explorer?action=tag&tagCode=${encodeURIComponent(searchQuery)}`
        );
        const data: ExplorerResponse = await response.json();
        if (data.success && data.tagDetails) {
          setSearchResult(data.tagDetails);
        } else {
          setSearchError('Tag not found on blockchain');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search');
    } finally {
      setSearchLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Truncate address/hash
  const truncate = (str: string, start: number = 6, end: number = 4) => {
    if (str.length <= start + end) return str;
    return `${str.slice(0, start)}...${str.slice(-end)}`;
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800">
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
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  // Get method badge color
  const getMethodBadge = (methodName: string) => {
    const colors: Record<string, string> = {
      createTag: 'bg-blue-100 text-blue-800',
      updateStatus: 'bg-yellow-100 text-yellow-800',
      revokeTag: 'bg-red-100 text-red-800',
    };
    return colors[methodName] || 'bg-gray-100 text-gray-800';
  };

  // Check if search result is a transaction
  const isTransaction = (
    result: TagDetails | Transaction
  ): result is Transaction => {
    return 'hash' in result && 'from' in result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Blocks className="h-7 w-7 text-blue-600" />
                Etags Explorer
              </h1>
              <p className="text-sm text-gray-600">
                Blockchain transaction explorer for Etags contract
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                fetchStats();
                fetchTransactions(page);
                fetchEvents();
              }}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by Transaction Hash (0x...) or Tag Code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {searchError}
              </div>
            )}

            {/* Search Result */}
            {searchResult && (
              <div className="mt-4 rounded-lg border bg-gray-50 p-4">
                {isTransaction(searchResult) ? (
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Transaction Details
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Hash:</span>
                        <span className="font-mono">
                          {truncate(searchResult.hash, 10, 8)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method:</span>
                        <Badge
                          className={getMethodBadge(searchResult.methodName)}
                        >
                          {searchResult.methodName}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(searchResult.status)}
                      </div>
                      {searchResult.decodedInput && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-gray-500">Decoded Input:</span>
                          <pre className="mt-1 rounded bg-gray-100 p-2 text-xs overflow-x-auto">
                            {JSON.stringify(searchResult.decodedInput, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tag Details
                    </h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tag ID:</span>
                        <span className="font-mono">
                          {truncate(searchResult.tagId, 10, 8)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valid:</span>
                        {searchResult.isValid ? (
                          <Badge className="bg-green-100 text-green-800">
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Invalid</Badge>
                        )}
                      </div>
                      {searchResult.statusLabel && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <Badge variant="secondary">
                            {searchResult.statusLabel}
                          </Badge>
                        </div>
                      )}
                      {searchResult.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span>
                            {new Date(searchResult.createdAt).toLocaleString(
                              'id-ID'
                            )}
                          </span>
                        </div>
                      )}
                      {searchResult.metadataURI && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-gray-500">Metadata URI:</span>
                          <a
                            href={searchResult.metadataURI}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-1 text-blue-600 hover:underline text-xs break-all"
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

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Tags</p>
                    <p className="text-2xl font-bold">{stats.totalTags}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Network</p>
                    <p className="text-lg font-bold">{stats.network}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Hash className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Chain ID</p>
                    <p className="text-2xl font-bold">{stats.chainId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-500">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono truncate">
                      {truncate(stats.contractAddress, 8, 6)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(stats.contractAddress)}
                    >
                      {copiedText === stats.contractAddress ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <a
                      href={`${BASESCAN_URL}/address/${stats.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for Transactions and Events */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions" className="gap-2">
              <FileCode className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Activity className="h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Transactions interacting with the Etags contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                {txLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No transactions found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tx Hash</TableHead>
                            <TableHead>Block</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow key={tx.hash}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="text-xs font-mono text-blue-600">
                                    {truncate(tx.hash)}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyToClipboard(tx.hash)}
                                  >
                                    {copiedText === tx.hash ? (
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>{tx.blockNumber}</TableCell>
                              <TableCell>
                                <Badge
                                  className={getMethodBadge(tx.methodName)}
                                >
                                  {tx.methodName}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs font-mono">
                                  {truncate(tx.from)}
                                </code>
                              </TableCell>
                              <TableCell>{getStatusBadge(tx.status)}</TableCell>
                              <TableCell className="text-xs text-gray-500">
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
                                  >
                                    Details
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    asChild
                                  >
                                    <a
                                      href={`${BASESCAN_URL}/tx/${tx.hash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4" />
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
                      <p className="text-sm text-gray-500">Page {page}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => {
                            setPage((p) => p - 1);
                            fetchTransactions(page - 1);
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!hasMore}
                          onClick={() => {
                            setPage((p) => p + 1);
                            fetchTransactions(page + 1);
                          }}
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
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Contract Events</CardTitle>
                <CardDescription>
                  Events emitted by the Etags contract
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No events found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Block</TableHead>
                          <TableHead>Transaction</TableHead>
                          <TableHead>Arguments</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event, index) => (
                          <TableRow key={`${event.transactionHash}-${index}`}>
                            <TableCell>
                              <Badge
                                className={
                                  event.event === 'TagCreated'
                                    ? 'bg-blue-100 text-blue-800'
                                    : event.event === 'TagRevoked'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {event.event}
                              </Badge>
                            </TableCell>
                            <TableCell>{event.blockNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono text-blue-600">
                                  {truncate(event.transactionHash)}
                                </code>
                                <a
                                  href={`${BASESCAN_URL}/tx/${event.transactionHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-600"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell>
                              <pre className="text-xs bg-gray-50 rounded p-2 max-w-md overflow-x-auto">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
