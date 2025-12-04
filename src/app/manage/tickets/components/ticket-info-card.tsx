'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ExternalLink } from 'lucide-react';
import { TicketFull, STATUS_CONFIG, PRIORITY_CONFIG } from './types';

interface TicketInfoCardProps {
  ticket: TicketFull;
}

export function TicketInfoCard({ ticket }: TicketInfoCardProps) {
  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priorityConfig =
    PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;

  return (
    <Card className="border-gray-100 shadow-sm overflow-hidden">
      <div
        className="h-1.5"
        style={{ backgroundColor: statusConfig.barColor }}
      />
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {ticket.ticket_number}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${priorityConfig.textColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`}
              />
              Prioritas {priorityConfig.label}
            </span>
          </div>
          <CardTitle className="text-xl text-gray-900">
            {ticket.subject}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pesan Awal
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Attachments */}
        {ticket.attachments.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Lampiran
            </p>
            <div className="flex gap-2 flex-wrap">
              {ticket.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {attachment.file_name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
