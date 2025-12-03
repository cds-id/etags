'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, Activity } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ExplorerHeader } from './components/explorer-header';
import { SearchCard } from './components/search-card';
import { StatsCards } from './components/stats-cards';
import { TransactionsTable } from './components/transactions-table';
import { EventsTable } from './components/events-table';
import type { ExplorerResponse } from '@/app/api/explorer/route';

type ContractStats = NonNullable<ExplorerResponse['stats']>;
type Transaction = NonNullable<ExplorerResponse['transactions']>[0];
type ContractEvent = NonNullable<ExplorerResponse['events']>[0];
type TagDetails = NonNullable<ExplorerResponse['tagDetails']>;

export default function ExplorerPage() {
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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTransactions(newPage);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchStats();
    fetchTransactions(page);
    fetchEvents();
  };

  return (
    <div className="relative min-h-screen bg-white font-sans overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#2B4C7E]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#A8A8A8]/20 blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <ExplorerHeader loading={loading} onRefresh={handleRefresh} />

          {/* Search Bar */}
          <SearchCard
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            searchLoading={searchLoading}
            searchError={searchError}
            searchResult={searchResult}
          />

          {/* Stats Cards */}
          {stats && (
            <StatsCards
              stats={stats}
              copiedText={copiedText}
              onCopy={copyToClipboard}
            />
          )}

          {/* Tabs for Transactions and Events */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList className="bg-[#2B4C7E]/10 border border-[#2B4C7E]/20">
              <TabsTrigger
                value="transactions"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2B4C7E]"
              >
                <FileCode className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2B4C7E]"
              >
                <Activity className="h-4 w-4" />
                Events
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <TransactionsTable
                transactions={transactions}
                loading={txLoading}
                page={page}
                hasMore={hasMore}
                copiedText={copiedText}
                onCopy={copyToClipboard}
                onPageChange={handlePageChange}
              />
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <EventsTable events={events} loading={eventsLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
