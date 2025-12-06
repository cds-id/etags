'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Stamp, AlertTriangle, Loader2 } from 'lucide-react';

type StampingCardProps = {
  isPublished: boolean;
  canStamp: boolean;
  isLoadingPreview: boolean;
  onStampClick: () => void;
};

export function StampingCard({
  isPublished,
  canStamp,
  isLoadingPreview,
  onStampClick,
}: StampingCardProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stamp className="h-5 w-5" />
          Pencapan Blockchain
        </CardTitle>
        <CardDescription>
          Cap tag ini ke blockchain untuk verifikasi permanen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPublished && (
          <div className="flex items-start gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-yellow-800 dark:text-yellow-200">
              Tag harus <strong>dipublikasikan</strong> sebelum dicap
            </p>
          </div>
        )}
        <Button
          type="button"
          onClick={onStampClick}
          disabled={!canStamp || isLoadingPreview}
          className="w-full"
          variant={canStamp ? 'default' : 'secondary'}
        >
          {isLoadingPreview ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memuat...
            </>
          ) : (
            <>
              <Stamp className="mr-2 h-4 w-4" />
              Cap ke Blockchain
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Tindakan ini tidak dapat dibatalkan. Data tag akan dicatat secara
          permanen di blockchain.
        </p>
      </CardContent>
    </Card>
  );
}
