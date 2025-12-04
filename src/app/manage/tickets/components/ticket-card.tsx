'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, ChevronRight, Wallet, Tag } from 'lucide-react';
import {
  TicketListItem,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
} from './types';

interface TicketCardProps {
  ticket: TicketListItem;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;
  const priorityConfig =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;

  return (
    <Card className="group border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Status indicator bar */}
          <div
            className="lg:w-1.5 h-1.5 lg:h-auto"
            style={{ backgroundColor: statusConfig.barColor }}
          />

          <div className="flex-1 p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              {/* Main content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Title row */}
                <div className="flex flex-wrap items-start gap-2">
                  <Link
                    href={`/manage/tickets/${ticket.id}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {ticket.subject}
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 font-medium`}
                    >
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${priorityConfig.textColor}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`}
                      />
                      {priorityConfig.label}
                    </span>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {ticket.ticket_number}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {ticket.tag.code}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Customer & assignee */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <Wallet className="w-3 h-3 text-gray-500" />
                    </div>
                    <span className="font-mono text-xs">
                      {ticket.wallet_address.slice(0, 6)}...
                      {ticket.wallet_address.slice(-4)}
                    </span>
                  </span>
                  {ticket.assignee && (
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      {ticket.assignee.name}
                    </span>
                  )}
                  {ticket._count.messages > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 text-gray-500" />
                      </div>
                      {ticket._count.messages} pesan
                    </span>
                  )}
                </div>
              </div>

              {/* Action button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 rounded-lg group-hover:border-blue-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors"
              >
                <Link href={`/manage/tickets/${ticket.id}`}>
                  Lihat Detail
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
