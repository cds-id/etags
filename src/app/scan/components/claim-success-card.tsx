'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

type ClaimSuccessCardProps = {
  message: string;
};

export function ClaimSuccessCard({ message }: ClaimSuccessCardProps) {
  return (
    <Card className="mb-6 border-2 border-emerald-300 bg-linear-to-br from-emerald-50 via-emerald-50/50 to-transparent shadow-lg shadow-emerald-500/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardContent className="flex items-center gap-3 p-4 relative">
        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <p className="text-emerald-800 font-medium">{message}</p>
      </CardContent>
    </Card>
  );
}
