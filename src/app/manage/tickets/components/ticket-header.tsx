'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { STATUS_CONFIG } from './types';

interface TicketHeaderProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  isUpdating: boolean;
}

export function TicketHeader({
  currentStatus,
  onStatusChange,
  isUpdating,
}: TicketHeaderProps) {
  const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.open;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <Button
        variant="ghost"
        asChild
        className="w-fit text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <Link href="/manage/tickets">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Tiket
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Status:</span>
        <Select
          value={currentStatus}
          onValueChange={onStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[160px] border-gray-200">
            <Badge
              className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}
            >
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">
              <span className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                Dibuka
              </span>
            </SelectItem>
            <SelectItem value="in_progress">
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                Diproses
              </span>
            </SelectItem>
            <SelectItem value="resolved">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Selesai
              </span>
            </SelectItem>
            <SelectItem value="closed">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-gray-500" />
                Ditutup
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
