'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { SupportHeader } from './support-header';

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

interface NFTProduct {
  id: number;
  tag: { id: number; code: string };
  products: { metadata: { name?: string }; brand: { name: string } }[];
  image_url: string;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline';
    icon: typeof Clock;
  }
> = {
  open: { label: 'Dibuka', variant: 'default', icon: AlertCircle },
  in_progress: { label: 'Diproses', variant: 'secondary', icon: Clock },
  resolved: { label: 'Selesai', variant: 'outline', icon: CheckCircle },
  closed: { label: 'Ditutup', variant: 'outline', icon: CheckCircle },
};

interface TicketListViewProps {
  walletAddress: string;
  tickets: Ticket[];
  nfts: NFTProduct[];
  onNewTicket: () => void;
  onViewTicket: (ticket: Ticket) => void;
}

export function TicketListView({
  walletAddress,
  tickets,
  nfts,
  onNewTicket,
  onViewTicket,
}: TicketListViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white">
      <SupportHeader walletAddress={walletAddress} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C2340]">
              Tiket Dukungan
            </h1>
            <p className="text-sm text-[#808080] mt-1">
              Kelola permintaan dukungan produk Anda
            </p>
          </div>
          <Button
            onClick={onNewTicket}
            disabled={nfts.length === 0}
            className="bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full shadow-lg shadow-[#2B4C7E]/30 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tiket Baru
          </Button>
        </div>

        {nfts.length === 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-800">
                Anda belum memiliki NFT produk. Beli produk dan klaim NFT Anda
                untuk mengakses dukungan.
              </p>
            </CardContent>
          </Card>
        )}

        {tickets.length === 0 ? (
          <Card className="border-[#A8A8A8]/20 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[#2B4C7E]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0C2340] mb-2">
                Belum ada tiket
              </h3>
              <p className="text-[#808080] mb-6 max-w-sm mx-auto">
                Buat tiket dukungan pertama Anda untuk mendapatkan bantuan
                dengan produk Anda.
              </p>
              {nfts.length > 0 && (
                <Button
                  onClick={onNewTicket}
                  className="bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full shadow-lg shadow-[#2B4C7E]/30"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Tiket Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const statusConfig =
                STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={ticket.id}
                  className="cursor-pointer border-[#A8A8A8]/20 hover:border-[#2B4C7E] hover:shadow-md transition-all group"
                  onClick={() => onViewTicket(ticket)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-[#0C2340] truncate">
                            {ticket.subject}
                          </span>
                          <Badge
                            variant={statusConfig.variant}
                            className="shrink-0"
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#808080]">
                          <span className="font-mono text-xs">
                            {ticket.ticket_number}
                          </span>
                          <span className="mx-2">•</span>
                          {ticket.brand.name}
                          <span className="mx-2">•</span>
                          {new Date(ticket.created_at).toLocaleDateString(
                            'id-ID'
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-[#2B4C7E]/30 text-[#2B4C7E] hover:bg-[#2B4C7E] hover:text-white rounded-full"
                      >
                        Lihat
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
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
