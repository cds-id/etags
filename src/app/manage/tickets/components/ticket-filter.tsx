'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface TicketFilterProps {
  value: string;
  onChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
}

export function TicketFilter({
  value,
  onChange,
  filteredCount,
  totalCount,
}: TicketFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
          <Filter className="w-4 h-4 text-gray-500" />
        </div>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tiket</SelectItem>
            <SelectItem value="open">Dibuka</SelectItem>
            <SelectItem value="in_progress">Diproses</SelectItem>
            <SelectItem value="resolved">Selesai</SelectItem>
            <SelectItem value="closed">Ditutup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-gray-500">
        Menampilkan{' '}
        <span className="font-semibold text-gray-700">{filteredCount}</span>{' '}
        dari <span className="font-semibold text-gray-700">{totalCount}</span>{' '}
        tiket
      </p>
    </div>
  );
}
