'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  TicketHeader,
  TicketInfoCard,
  ConversationCard,
  TicketDetailsSidebar,
  CustomerSidebar,
  ProductSidebar,
  TicketFull,
  Product,
  STATUS_CONFIG,
} from '../components';
import {
  replyToTicket,
  updateTicketStatus,
} from '@/lib/actions/support-tickets';

interface TicketDetailProps {
  ticket: TicketFull;
  products: Product[];
}

export function TicketDetail({ ticket, products }: TicketDetailProps) {
  const router = useRouter();
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);

  const handleReply = useCallback(async () => {
    if (!reply.trim()) return;

    setIsSending(true);
    try {
      const result = await replyToTicket(ticket.id, reply);
      if (result.success) {
        toast.success('Balasan terkirim');
        setReply('');
        router.refresh();
      } else {
        toast.error(result.error || 'Gagal mengirim balasan');
      }
    } catch {
      toast.error('Gagal mengirim balasan');
    } finally {
      setIsSending(false);
    }
  }, [reply, ticket.id, router]);

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      setIsUpdating(true);
      try {
        const result = await updateTicketStatus(ticket.id, newStatus);
        if (result.success) {
          setCurrentStatus(newStatus);
          toast.success(
            `Status diubah ke ${STATUS_CONFIG[newStatus]?.label || newStatus}`
          );
        } else {
          toast.error(result.error || 'Gagal mengubah status');
        }
      } catch {
        toast.error('Gagal mengubah status');
      } finally {
        setIsUpdating(false);
      }
    },
    [ticket.id]
  );

  return (
    <div className="container py-6 max-w-7xl">
      <TicketHeader
        currentStatus={currentStatus}
        onStatusChange={handleStatusChange}
        isUpdating={isUpdating}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <TicketInfoCard ticket={{ ...ticket, status: currentStatus }} />
          <ConversationCard
            messages={ticket.messages}
            isClosed={currentStatus === 'closed'}
            reply={reply}
            onReplyChange={setReply}
            onSendReply={handleReply}
            isSending={isSending}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TicketDetailsSidebar ticket={{ ...ticket, status: currentStatus }} />
          <CustomerSidebar walletAddress={ticket.wallet_address} />
          <ProductSidebar tag={ticket.tag} products={products} />
        </div>
      </div>
    </div>
  );
}
