'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ConnectWallet,
  LoadingState,
  TicketListView,
  NewTicketForm,
  TicketDetailView,
} from './components';
import {
  getNFTsByWallet,
  getTicketsByWallet,
  getTicketByNumber,
} from '@/lib/actions/support-tickets';

// Use existing window.ethereum type from verify page
type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    callback: (...args: unknown[]) => void
  ) => void;
};

function getEthereum(): EthereumProvider | undefined {
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum as unknown as EthereumProvider;
  }
  return undefined;
}

interface Product {
  id: number;
  code: string;
  metadata: { name?: string; images?: string[] };
  brand: { id: number; name: string };
}

interface NFTProduct {
  id: number;
  tag: { id: number; code: string };
  products: Product[];
  image_url: string;
}

interface TicketMessage {
  id: number;
  sender_type: string;
  message: string;
  created_at: string | Date;
  sender?: { name: string; role: string } | null;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  created_at: string | Date;
  brand: { name: string };
  tag: { code: string };
  messages: TicketMessage[];
}

export function SupportPageClient() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [nfts, setNfts] = useState<NFTProduct[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      toast.error('Silakan instal MetaMask atau wallet Web3 lainnya');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (accounts[0]) {
        setWalletAddress(accounts[0]);
        toast.success('Wallet terhubung!');
      }
    } catch {
      toast.error('Gagal menghubungkan wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setWalletAddress(null);
        setNfts([]);
        setTickets([]);
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0]);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [walletAddress]);

  // Fetch NFTs and tickets when wallet connected
  const fetchData = useCallback(async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      const [nftData, ticketData] = await Promise.all([
        getNFTsByWallet(walletAddress),
        getTicketsByWallet(walletAddress),
      ]);

      setNfts(nftData as NFTProduct[]);
      setTickets(ticketData as Ticket[]);
    } catch (error) {
      console.error('Gagal memuat data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewTicket = async (ticket: Ticket) => {
    if (!walletAddress) return;

    try {
      const fullTicket = await getTicketByNumber(
        ticket.ticket_number,
        walletAddress
      );
      if (fullTicket) {
        setSelectedTicket(fullTicket as Ticket);
        setView('detail');
      }
    } catch {
      toast.error('Gagal memuat tiket');
    }
  };

  const handleTicketCreated = () => {
    setView('list');
    fetchData();
  };

  const handleMessageSent = async () => {
    if (!selectedTicket || !walletAddress) return;

    try {
      const fullTicket = await getTicketByNumber(
        selectedTicket.ticket_number,
        walletAddress
      );
      if (fullTicket) {
        setSelectedTicket(fullTicket as Ticket);
      }
    } catch {
      toast.error('Gagal memuat tiket');
    }
  };

  // Not connected
  if (!walletAddress) {
    return (
      <ConnectWallet onConnect={connectWallet} isConnecting={isConnecting} />
    );
  }

  // Loading
  if (isLoading) {
    return <LoadingState />;
  }

  // Ticket detail view
  if (view === 'detail' && selectedTicket) {
    return (
      <TicketDetailView
        walletAddress={walletAddress}
        ticket={selectedTicket}
        onBack={() => {
          setView('list');
          setSelectedTicket(null);
        }}
        onMessageSent={handleMessageSent}
      />
    );
  }

  // New ticket form
  if (view === 'new') {
    return (
      <NewTicketForm
        walletAddress={walletAddress}
        nfts={nfts}
        onBack={() => setView('list')}
        onSuccess={handleTicketCreated}
      />
    );
  }

  // Ticket list
  return (
    <TicketListView
      walletAddress={walletAddress}
      tickets={tickets}
      nfts={nfts}
      onNewTicket={() => setView('new')}
      onViewTicket={handleViewTicket}
    />
  );
}
