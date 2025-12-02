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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const presets = role === 'admin' ? ADMIN_PRESETS : BRAND_PRESETS;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              AI Assistant
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {role === 'admin'
                ? 'Analisis platform dan insights'
                : 'Analisis produk dan performa brand'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Online
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-[400px] max-h-[500px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-1">
                  Hai! Saya AI Assistant
                </p>
                <p className="text-sm text-muted-foreground">
                  Pilih pertanyaan di bawah atau ketik sendiri
                </p>
              </div>

              {/* Preset Questions Grid */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-md px-4">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset.question)}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors text-left text-sm"
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="font-medium">{preset.label}</span>
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

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Presets (shown when there are messages) */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-t bg-background/50 overflow-x-auto">
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
        <div className="border-t bg-background p-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] max-h-[100px]"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
