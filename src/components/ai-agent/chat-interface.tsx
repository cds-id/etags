'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import type { Message } from '@/types/ai-agent';

type ChatInterfaceProps = {
  initialMessages?: Message[];
  onMessageSent?: (message: string) => void;
  className?: string;
};

export function ChatInterface({
  initialMessages = [],
  onMessageSent,
  className = '',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      id: Date.now().toString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    onMessageSent?.(userMessage.content);

    try {
      // Send to API
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
            { role: 'user', content: userMessage.content },
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
          : 'Failed to send message. Please try again.'
      );

      // Remove the user message if there was an error
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

  const handleRetry = () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.role === 'user');

    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setError(null);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg font-medium mb-2">
              👋 Hai! Saya AI Assistant
            </p>
            <p className="text-sm">
              Tanyakan apa saja tentang produk, tag, dan statistik Anda.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="text-muted-foreground/80">Contoh pertanyaan:</p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setInput('Berapa total produk saya?')}
                  className="text-primary hover:underline"
                >
                  • Berapa total produk saya?
                </button>
                <button
                  onClick={() =>
                    setInput('Berapa tag yang sudah di-stamp ke blockchain?')
                  }
                  className="text-primary hover:underline"
                >
                  • Berapa tag yang sudah di-stamp?
                </button>
                <button
                  onClick={() =>
                    setInput('Jelaskan tentang blockchain authentication')
                  }
                  className="text-primary hover:underline"
                >
                  • Jelaskan blockchain authentication
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
            <p className="text-destructive font-medium mb-1">Error</p>
            <p className="text-destructive/80">{error}</p>
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Coba Lagi
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan Anda... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px] max-h-[120px]"
            disabled={isLoading}
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          AI dapat membuat kesalahan. Periksa informasi penting.
        </p>
      </div>
    </div>
  );
}
