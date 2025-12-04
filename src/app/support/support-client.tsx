'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Wallet,
  MessageSquare,
  Plus,
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

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
  created_at: string;
  sender?: { name: string; role: string } | null;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  created_at: string;
  brand: { name: string };
  tag: { code: string };
  messages: TicketMessage[];
}

const CATEGORIES = [
  { value: 'defect', label: 'Product Defect' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'missing_parts', label: 'Missing Parts' },
  { value: 'warranty', label: 'Warranty Claim' },
  { value: 'other', label: 'Other' },
];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline';
    icon: typeof Clock;
  }
> = {
  open: { label: 'Open', variant: 'default', icon: AlertCircle },
  in_progress: { label: 'In Progress', variant: 'secondary', icon: Clock },
  resolved: { label: 'Resolved', variant: 'outline', icon: CheckCircle },
  closed: { label: 'Closed', variant: 'outline', icon: CheckCircle },
};

export function SupportPageClient() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [nfts, setNfts] = useState<NFTProduct[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [selectedNFT, setSelectedNFT] = useState<NFTProduct | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const connectWallet = async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      if (accounts[0]) {
        setWalletAddress(accounts[0]);
        toast.success('Wallet connected!');
      }
    } catch {
      toast.error('Failed to connect wallet');
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
  useEffect(() => {
    if (!walletAddress) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [nftRes, ticketRes] = await Promise.all([
          fetch(`/api/support/nfts?wallet=${walletAddress}`),
          fetch(`/api/support/tickets?wallet=${walletAddress}`),
        ]);

        const nftData = await nftRes.json();
        const ticketData = await ticketRes.json();

        setNfts(nftData.nfts || []);
        setTickets(ticketData.tickets || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [walletAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT || !walletAddress) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagId: selectedNFT.tag.id,
          walletAddress,
          category,
          subject,
          description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Ticket created: ${data.ticketNumber}`);
        setView('list');
        // Refresh tickets
        const ticketRes = await fetch(
          `/api/support/tickets?wallet=${walletAddress}`
        );
        const ticketData = await ticketRes.json();
        setTickets(ticketData.tickets || []);
        // Reset form
        setSelectedNFT(null);
        setCategory('');
        setSubject('');
        setDescription('');
      } else {
        toast.error(data.error || 'Failed to create ticket');
      }
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !walletAddress || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/support/tickets/${selectedTicket.ticket_number}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            message: newMessage,
          }),
        }
      );

      if (res.ok) {
        // Refresh ticket
        const ticketRes = await fetch(
          `/api/support/tickets/${selectedTicket.ticket_number}/messages?wallet=${walletAddress}`
        );
        const ticketData = await ticketRes.json();
        if (ticketData.ticket) {
          setSelectedTicket(ticketData.ticket);
        }
        setNewMessage('');
        toast.success('Message sent');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewTicket = async (ticket: Ticket) => {
    if (!walletAddress) return;

    try {
      const res = await fetch(
        `/api/support/tickets/${ticket.ticket_number}/messages?wallet=${walletAddress}`
      );
      const data = await res.json();
      if (data.ticket) {
        setSelectedTicket(data.ticket);
        setView('detail');
      }
    } catch {
      toast.error('Failed to load ticket');
    }
  };

  // Not connected
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Connect your wallet to view your products and submit support
              tickets.
            </p>
            <Button onClick={connectWallet} disabled={isConnecting} size="lg">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your products...</p>
        </div>
      </div>
    );
  }

  // Ticket detail view
  if (view === 'detail' && selectedTicket) {
    const statusConfig =
      STATUS_CONFIG[selectedTicket.status] || STATUS_CONFIG.open;
    const StatusIcon = statusConfig.icon;

    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-8">
          <Button
            variant="ghost"
            onClick={() => {
              setView('list');
              setSelectedTicket(null);
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedTicket.ticket_number}
                  </p>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTicket.brand.name} •{' '}
                    {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusConfig.variant}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Original description */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Original Message:</p>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Messages */}
              {selectedTicket.messages.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Conversation:</p>
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.sender_type === 'customer'
                          ? 'bg-primary/10 ml-8'
                          : 'bg-muted mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {msg.sender_type === 'customer'
                            ? 'You'
                            : msg.sender?.name || 'Support'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              {selectedTicket.status !== 'closed' && (
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // New ticket form
  if (view === 'new') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl py-8">
          <Button
            variant="ghost"
            onClick={() => {
              setView('list');
              setSelectedNFT(null);
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>New Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedNFT ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Select a product to create a ticket:
                  </p>
                  <div className="grid gap-4">
                    {nfts.map((nft) => (
                      <Card
                        key={nft.tag.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedNFT(nft)}
                      >
                        <CardContent className="flex items-center gap-4 p-4">
                          {nft.image_url && (
                            <img
                              src={nft.image_url}
                              alt="NFT"
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">
                              {nft.products[0]?.metadata?.name || nft.tag.code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {nft.products[0]?.brand?.name}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {nfts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No products found. You need to own an NFT to submit a
                        ticket.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Selected product:
                    </p>
                    <p className="font-medium">
                      {selectedNFT.products[0]?.metadata?.name ||
                        selectedNFT.tag.code}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => setSelectedNFT(null)}
                    >
                      Change product
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isSubmitting || !category || !subject || !description
                    }
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Ticket list
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-sm text-muted-foreground">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          </div>
          <Button onClick={() => setView('new')} disabled={nfts.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {nfts.length === 0 && (
          <Card className="mb-6">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">
                You don&apos;t own any product NFTs yet. Purchase a product and
                claim your NFT to access support.
              </p>
            </CardContent>
          </Card>
        )}

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tickets yet</p>
              {nfts.length > 0 && (
                <Button onClick={() => setView('new')} className="mt-4">
                  Create Your First Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const statusConfig =
                STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => viewTicket(ticket)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{ticket.subject}</p>
                        <Badge
                          variant={statusConfig.variant}
                          className="shrink-0"
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.ticket_number} • {ticket.brand.name} •{' '}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 shrink-0"
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
