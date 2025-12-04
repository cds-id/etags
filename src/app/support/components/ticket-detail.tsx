'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { SupportHeader } from './support-header';
import { addCustomerMessage } from '@/lib/actions/support-tickets';

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

interface TicketDetailViewProps {
  walletAddress: string;
  ticket: Ticket;
  onBack: () => void;
  onMessageSent: () => void;
}

export function TicketDetailView({
  walletAddress,
  ticket,
  onBack,
  onMessageSent,
}: TicketDetailViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await addCustomerMessage(
        ticket.ticket_number,
        walletAddress,
        newMessage
      );

      if (result.success) {
        setNewMessage('');
        toast.success('Pesan terkirim');
        onMessageSent();
      } else {
        toast.error(result.error || 'Gagal mengirim pesan');
      }
    } catch {
      toast.error('Gagal mengirim pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white">
      <SupportHeader walletAddress={walletAddress} showBack onBack={onBack} />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        <Card className="border-[#A8A8A8]/20 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#2B4C7E]/5 to-transparent border-b border-[#A8A8A8]/10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-[#808080] mb-2">
                  {ticket.ticket_number}
                </p>
                <CardTitle className="text-lg sm:text-xl text-[#0C2340] break-words">
                  {ticket.subject}
                </CardTitle>
                <p className="text-sm text-[#808080] mt-2">
                  {ticket.brand.name} •{' '}
                  {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <Badge
                variant={statusConfig.variant}
                className="shrink-0 self-start"
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Original description */}
            <div className="p-4 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/10">
              <p className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider mb-2">
                Pesan Awal
              </p>
              <p className="text-sm text-[#0C2340] whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </div>

            {/* Messages */}
            {ticket.messages.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                  Percakapan
                </p>
                {ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl ${
                      msg.sender_type === 'customer'
                        ? 'bg-[#2B4C7E] text-white ml-4 sm:ml-12'
                        : 'bg-gray-100 text-[#0C2340] mr-4 sm:mr-12'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <p
                        className={`text-xs font-semibold ${msg.sender_type === 'customer' ? 'text-white/80' : 'text-[#808080]'}`}
                      >
                        {msg.sender_type === 'customer'
                          ? 'Anda'
                          : msg.sender?.name || 'Dukungan'}
                      </p>
                      <p
                        className={`text-xs ${msg.sender_type === 'customer' ? 'text-white/60' : 'text-[#A8A8A8]'}`}
                      >
                        {new Date(msg.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            {ticket.status !== 'closed' && (
              <div className="pt-4 border-t border-[#A8A8A8]/20">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    rows={3}
                    className="flex-1 resize-none border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.trim()}
                    className="sm:self-end bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full px-6"
                  >
                    <Send className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Kirim</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
