'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, Activity, Gem } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ExplorerHeader } from './components/explorer-header';
import { SearchCard } from './components/search-card';
import { StatsCards } from './components/stats-cards';
import { TransactionsTable } from './components/transactions-table';
import { EventsTable } from './components/events-table';
import { NFTsGrid } from './components/nfts-grid';
import type { ExplorerResponse, PublicNFT } from '@/app/api/explorer/route';

type ContractStats = NonNullable<ExplorerResponse['stats']>;
type Transaction = NonNullable<ExplorerResponse['transactions']>[0];
type ContractEvent = NonNullable<ExplorerResponse['events']>[0];
type TagDetails = NonNullable<ExplorerResponse['tagDetails']>;

export default function ExplorerPage() {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [nfts, setNfts] = useState<PublicNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [nftPage, setNftPage] = useState(1);
  const [nftHasMore, setNftHasMore] = useState(false);
  const [nftTotal, setNftTotal] = useState(0);
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

  // Fetch NFTs
  const fetchNfts = useCallback(async (pageNum: number = 1) => {
    setNftsLoading(true);
    try {
      const response = await fetch(
        `/api/explorer?action=nfts&page=${pageNum}&pageSize=12`
      );
      const data: ExplorerResponse = await response.json();
      if (data.success && data.nfts) {
        setNfts(data.nfts);
        setNftHasMore(data.pagination?.hasMore || false);
        setNftTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
    } finally {
      setNftsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchTransactions(1),
        fetchEvents(),
        fetchNfts(1),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchStats, fetchTransactions, fetchEvents, fetchNfts]);

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

  // Handle NFT page change
  const handleNftPageChange = (newPage: number) => {
    setNftPage(newPage);
    fetchNfts(newPage);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchStats();
    fetchTransactions(page);
    fetchEvents();
    fetchNfts(nftPage);
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

          {/* Tabs for Transactions, Events, and NFTs */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="bg-[#2B4C7E]/10 border border-[#2B4C7E]/20 w-full sm:w-auto min-w-max">
                <TabsTrigger
                  value="transactions"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2B4C7E] flex-1 sm:flex-initial px-3 sm:px-4"
                >
                  <FileCode className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Transactions</span>
                  <span className="sm:hidden">Txns</span>
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#2B4C7E] flex-1 sm:flex-initial px-3 sm:px-4"
                >
                  <Activity className="h-4 w-4 shrink-0" />
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="nfts"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-purple-600 flex-1 sm:flex-initial px-3 sm:px-4"
                >
                  <Gem className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">NFT Collectibles</span>
                  <span className="sm:hidden">NFTs</span>
                </TabsTrigger>
              </TabsList>
            </div>

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

            {/* NFTs Tab */}
            <TabsContent value="nfts">
              <NFTsGrid
                nfts={nfts}
                loading={nftsLoading}
                page={nftPage}
                hasMore={nftHasMore}
                total={nftTotal}
                copiedText={copiedText}
                onCopy={copyToClipboard}
                onPageChange={handleNftPageChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
