'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from 'lucide-react';

interface Ticket {
  id: number;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  wallet_address: string;
  created_at: Date | string;
  tag: { code: string };
  brand: { name: string };
  assignee: { name: string } | null;
  _count: { messages: number };
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    icon: typeof Clock;
  }
> = {
  open: { label: 'Open', variant: 'default', icon: AlertCircle },
  in_progress: { label: 'In Progress', variant: 'secondary', icon: Clock },
  resolved: { label: 'Resolved', variant: 'outline', icon: CheckCircle },
  closed: { label: 'Closed', variant: 'outline', icon: CheckCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-gray-500' },
  normal: { label: 'Normal', className: 'text-blue-500' },
  high: { label: 'High', className: 'text-orange-500' },
  urgent: { label: 'Urgent', className: 'text-red-500' },
};

interface TicketListProps {
  initialTickets: Ticket[];
}

export function TicketList({ initialTickets }: TicketListProps) {
  const [tickets] = useState<Ticket[]>(initialTickets);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === 'all') return true;
    return ticket.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {filteredTickets.length} ticket
          {filteredTickets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Ticket list */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tickets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const statusConfig =
              STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const StatusIcon = statusConfig.icon;
            const priorityConfig =
              PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;

            return (
              <Card
                key={ticket.id}
                className="hover:border-primary transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          href={`/manage/tickets/${ticket.id}`}
                          className="font-medium hover:underline truncate"
                        >
                          {ticket.subject}
                        </Link>
                        <Badge
                          variant={statusConfig.variant}
                          className="shrink-0"
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                        <span className={`text-xs ${priorityConfig.className}`}>
                          {priorityConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span>{ticket.ticket_number}</span>
                        <span>•</span>
                        <span>{ticket.brand.name}</span>
                        <span>•</span>
                        <span>Tag: {ticket.tag.code}</span>
                        <span>•</span>
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Customer: {ticket.wallet_address.slice(0, 6)}...
                          {ticket.wallet_address.slice(-4)}
                        </span>
                        {ticket.assignee && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {ticket.assignee.name}
                          </span>
                        )}
                        {ticket._count.messages > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {ticket._count.messages}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0"
                    >
                      <Link href={`/manage/tickets/${ticket.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
