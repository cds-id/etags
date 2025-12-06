'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Wallet, User } from 'lucide-react';
import { TicketMessage } from './types';

interface ConversationCardProps {
  messages: TicketMessage[];
  isClosed: boolean;
  reply: string;
  onReplyChange: (value: string) => void;
  onSendReply: () => void;
  isSending: boolean;
}

export function ConversationCard({
  messages,
  isClosed,
  reply,
  onReplyChange,
  onSendReply,
  isSending,
}: ConversationCardProps) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <CardTitle className="text-lg text-gray-900">Percakapan</CardTitle>
          {messages.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {messages.length} pesan
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Belum ada balasan</p>
            <p className="text-xs text-gray-400 mt-1">
              Jadilah yang pertama membalas tiket ini
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl ${
                  msg.sender_type === 'customer'
                    ? 'bg-gray-100 mr-4 sm:mr-12'
                    : 'bg-blue-50 ml-4 sm:ml-12 border border-blue-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        msg.sender_type === 'customer'
                          ? 'bg-gray-200'
                          : 'bg-blue-100'
                      }`}
                    >
                      {msg.sender_type === 'customer' ? (
                        <Wallet className="w-3.5 h-3.5 text-gray-600" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        msg.sender_type === 'customer'
                          ? 'text-gray-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {msg.sender_type === 'customer'
                        ? 'Pelanggan'
                        : msg.sender?.name || 'Dukungan'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        {!isClosed && (
          <div className="pt-4 border-t border-gray-100">
            <div className="space-y-3">
              <Textarea
                value={reply}
                onChange={(e) => onReplyChange(e.target.value)}
                placeholder="Ketik balasan untuk pelanggan..."
                rows={4}
                className="resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <div className="flex justify-end">
                <Button
                  onClick={onSendReply}
                  disabled={isSending || !reply.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? 'Mengirim...' : 'Kirim Balasan'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
