'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { STATUS_CONFIG } from './types';

interface EmptyStateProps {
  statusFilter: string;
}

export function EmptyState({ statusFilter }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardContent className="py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Tidak ada tiket
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          {statusFilter !== 'all'
            ? `Tidak ada tiket dengan status "${STATUS_CONFIG[statusFilter]?.label.toLowerCase() || statusFilter}". Coba ubah filter.`
            : 'Belum ada tiket dukungan yang dikirim.'}
        </p>
      </CardContent>
    </Card>
  );
}
