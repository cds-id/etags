'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Ban, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { StatusUpdateResult } from './types';

type RevokeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revokeReason: string;
  onRevokeReasonChange: (reason: string) => void;
  statusUpdateResult: StatusUpdateResult;
  isUpdatingStatus: boolean;
  onConfirmRevoke: () => void;
  onReset: () => void;
};

export function RevokeDialog({
  open,
  onOpenChange,
  revokeReason,
  onRevokeReasonChange,
  statusUpdateResult,
  isUpdatingStatus,
  onConfirmRevoke,
  onReset,
}: RevokeDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
    onRevokeReasonChange('');
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5" />
            Cabut Tag
          </DialogTitle>
          <DialogDescription>
            Ini akan membatalkan tag secara permanen di blockchain. Tindakan ini
            tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {statusUpdateResult?.success ? (
          <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
            <Check className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Tag Berhasil Dicabut
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Tag telah dibatalkan secara permanen di blockchain
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium">Peringatan</p>
                <ul className="mt-1 list-inside list-disc text-red-600 dark:text-red-400">
                  <li>Tag akan ditandai tidak valid di blockchain</li>
                  <li>Pemindaian kode QR akan menampilkan status pencabutan</li>
                  <li>Tindakan ini permanen dan tidak dapat dibatalkan</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revoke_reason">
                Alasan Pencabutan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="revoke_reason"
                value={revokeReason}
                onChange={(e) => onRevokeReasonChange(e.target.value)}
                placeholder="cth. Pemalsuan terdeteksi, Produk ditarik, Tag dikompromikan..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Alasan ini akan dicatat di blockchain
              </p>
            </div>

            {statusUpdateResult?.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {statusUpdateResult.error}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!statusUpdateResult?.success && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUpdatingStatus}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirmRevoke}
                disabled={isUpdatingStatus || !revokeReason.trim()}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mencabut...
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Konfirmasi Pencabutan
                  </>
                )}
              </Button>
            </>
          )}
          {statusUpdateResult?.success && (
            <Button onClick={handleClose}>Selesai</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
