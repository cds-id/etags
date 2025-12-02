'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

type ErrorCardProps = {
  error: string;
};

export function ErrorCard({ error }: ErrorCardProps) {
  return (
    <Card className="mb-6 border-0 bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent shadow-lg shadow-red-500/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="flex items-start gap-4 p-4 sm:p-5 relative">
        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
          <AlertCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-red-800 dark:text-red-300">
            Terjadi Kesalahan
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
        </div>
      </CardContent>
    </Card>
  );
}
