'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

type ClaimSuccessCardProps = {
  message: string;
};

export function ClaimSuccessCard({ message }: ClaimSuccessCardProps) {
  return (
    <Card className="mb-4 border-green-200 bg-green-50">
      <CardContent className="flex items-center gap-3 p-4">
        <CheckCircle2 className="h-6 w-6 text-green-500" />
        <p className="text-green-700">{message}</p>
      </CardContent>
    </Card>
  );
}
