'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/ai-agent';

type PresetQuestion = {
  label: string;
  question: string;
  icon?: string;
};

type ChatSectionProps = {
  role: 'admin' | 'brand';
  className?: string;
};

// Preset questions based on user role
const ADMIN_PRESETS: PresetQuestion[] = [
  {
    label: 'Total statistik',
    question: 'Berikan ringkasan statistik keseluruhan platform',
    icon: '📊',
  },
  {
    label: 'Tag tercap',
    question: 'Berapa persen tag yang sudah di-stamp ke blockchain?',
    icon: '🏷️',
  },
  {
    label: 'Brand aktif',
    question: 'Brand mana yang paling aktif membuat tag?',
    icon: '🏢',
  },
  {
    label: 'Scan terbanyak',
    question: 'Produk mana yang paling sering di-scan?',
    icon: '📱',
  },
  {
    label: 'Deteksi fraud',
    question: 'Apakah ada aktivitas mencurigakan yang perlu diperhatikan?',
    icon: '🚨',
  },
  {
    label: 'Tren mingguan',
    question: 'Bagaimana tren pembuatan tag minggu ini?',
    icon: '📈',
  },
];

const BRAND_PRESETS: PresetQuestion[] = [
  {
    label: 'Performa produk',
    question: 'Bagaimana performa produk saya?',
    icon: '📦',
  },
  {
    label: 'Tag tercap',
    question: 'Berapa tag saya yang sudah di-stamp ke blockchain?',
    icon: '🏷️',
  },
  {
    label: 'Scan terbanyak',
    question: 'Produk mana yang paling sering di-scan?',
    icon: '📱',
  },
  {
    label: 'Distribusi geografis',
    question: 'Dari mana saja produk saya di-scan?',
    icon: '🗺️',
  },
  {
    label: 'Klaim produk',
    question: 'Berapa banyak tag yang sudah di-klaim pengguna?',
    icon: '✅',
  },
  {
    label: 'Rekomendasi',
    question: 'Apa rekomendasi untuk meningkatkan engagement produk?',
    icon: '💡',
  },
];

export function ChatSection({ role, className }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const presets = role === 'admin' ? ADMIN_PRESETS : BRAND_PRESETS;

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: text },
          ],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        id: (Date.now() + 1).toString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengirim pesan. Silakan coba lagi.'
      );
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePresetClick = (question: string) => {
    handleSend(question);
  };

  return (
    <Card className={cn('flex flex-col gap-0 py-0 h-full', className)}>
      <CardHeader className="py-3 px-4 border-b bg-linear-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-t-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              AI Assistant
              <Sparkles className="h-4 w-4 text-amber-500" />
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {role === 'admin'
                ? 'Platform analytics & insights'
                : 'Brand performance assistant'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 min-h-[200px] max-h-[400px]"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-4">
              <div className="text-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <p className="text-base font-medium mb-0.5">
                  Hai! Saya AI Assistant
                </p>
                <p className="text-xs text-muted-foreground">
                  Pilih pertanyaan atau ketik sendiri
                </p>
              </div>

              {/* Preset Questions Grid */}
              <div className="grid grid-cols-2 gap-1.5 w-full max-w-sm px-3">
                {presets.slice(0, 4).map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset.question)}
                    className="flex items-center gap-1.5 p-2 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-left text-xs"
                  >
                    <span>{preset.icon}</span>
                    <span className="font-medium truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && <TypingIndicator />}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                  <p className="text-destructive font-medium mb-1">Error</p>
                  <p className="text-destructive/80">{error}</p>
                  <Button
                    onClick={() => setError(null)}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Tutup
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Presets (shown when there are messages) */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-t bg-background/50 overflow-x-auto shrink-0">
            <div className="flex gap-2">
              {presets.slice(0, 4).map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset.question)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-xs whitespace-nowrap disabled:opacity-50"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-background p-3 shrink-0">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[80px]"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
