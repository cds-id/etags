'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Tag,
  Wallet,
  Calendar,
} from 'lucide-react';
import {
  replyToTicket,
  updateTicketStatus,
} from '@/lib/actions/support-tickets';

interface TicketMessage {
  id: number;
  sender_type: string;
  message: string;
  created_at: Date | string;
  sender?: { name: string; role: string } | null;
}

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  wallet_address: string;
  created_at: Date | string;
  resolved_at: Date | string | null;
  tag: {
    code: string;
    nft: { image_url: string } | null;
  };
  brand: { name: string };
  assignee: { id: number; name: string; email: string } | null;
  messages: TicketMessage[];
  attachments: { id: number; file_url: string; file_name: string }[];
}

interface Product {
  id: number;
  code: string;
  metadata: unknown;
}

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

const CATEGORY_LABELS: Record<string, string> = {
  defect: 'Product Defect',
  quality: 'Quality Issue',
  missing_parts: 'Missing Parts',
  warranty: 'Warranty Claim',
  other: 'Other',
};

interface TicketDetailProps {
  ticket: Ticket;
  products: Product[];
}

export function TicketDetail({ ticket, products }: TicketDetailProps) {
  const router = useRouter();
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);

  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;

  const handleReply = async () => {
    if (!reply.trim()) return;

    setIsSending(true);
    try {
      const result = await replyToTicket(ticket.id, reply);
      if (result.success) {
        toast.success('Reply sent');
        setReply('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to send reply');
      }
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const result = await updateTicketStatus(ticket.id, newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
        toast.success(
          `Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`
        );
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/manage/tickets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {ticket.ticket_number}
                  </p>
                  <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={currentStatus}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px]">
                      <Badge variant={statusConfig.variant}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Original Message:</p>
                <p className="text-sm whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* Attachments */}
              {ticket.attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Attachments:</p>
                  <div className="flex gap-2 flex-wrap">
                    {ticket.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {attachment.file_name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No replies yet
                </p>
              ) : (
                ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.sender_type === 'customer'
                        ? 'bg-muted'
                        : 'bg-primary/10 ml-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">
                        {msg.sender_type === 'customer' ? (
                          <span className="flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            Customer
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {msg.sender?.name || 'Support'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}

              {/* Reply form */}
              {currentStatus !== 'closed' && (
                <div className="pt-4 border-t">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="mb-3"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={isSending || !reply.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">
                  {CATEGORY_LABELS[ticket.category] || ticket.category}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <p className="font-medium capitalize">{ticket.priority}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </p>
                <p className="font-medium">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>
              {ticket.resolved_at && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Resolved
                  </p>
                  <p className="font-medium">
                    {new Date(ticket.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
              {ticket.assignee && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Assigned To
                  </p>
                  <p className="font-medium">{ticket.assignee.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-3 w-3" />
                  Wallet Address
                </p>
                <p className="font-mono text-sm break-all">
                  {ticket.wallet_address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tag Code
                </p>
                <p className="font-mono text-sm">{ticket.tag.code}</p>
              </div>
              {ticket.tag.nft?.image_url && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">NFT</p>
                  <img
                    src={ticket.tag.nft.image_url}
                    alt="NFT"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              {products.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Products</p>
                  {products.map((product) => (
                    <div key={product.id} className="text-sm">
                      <p className="font-medium">
                        {(product.metadata as { name?: string })?.name ||
                          product.code}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
