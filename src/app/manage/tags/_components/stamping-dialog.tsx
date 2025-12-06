'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Stamp, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { PreviewStampingResult, StampResult } from './types';

type StampingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stampPreview: PreviewStampingResult | null;
  stampResult: StampResult;
  isStamping: boolean;
  onConfirmStamp: () => void;
  onReset: () => void;
};

export function StampingDialog({
  open,
  onOpenChange,
  stampPreview,
  stampResult,
  isStamping,
  onConfirmStamp,
  onReset,
}: StampingDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stamp className="h-5 w-5" />
            Konfirmasi Pencapan Blockchain
          </DialogTitle>
          <DialogDescription>
            Tinjau detail tag sebelum mencap ke blockchain. Tindakan ini tidak
            dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {stampResult?.success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <Check className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Berhasil Dicap!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Tag telah dicatat secara permanen di blockchain
                </p>
              </div>
            </div>
            {stampResult.data && (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Hash Transaksi:</strong>
                </p>
                <code className="block rounded bg-muted p-2 text-xs break-all">
                  {stampResult.data.txHash}
                </code>
              </div>
            )}
          </div>
        ) : stampResult?.error ? (
          <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950 p-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Pencapan Gagal
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {stampResult.error}
              </p>
            </div>
          </div>
        ) : stampPreview?.canStamp === false ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Tidak Dapat Mencap Tag
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-yellow-700 dark:text-yellow-300">
                  {stampPreview.reasons?.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : stampPreview?.metadata ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Detail Tag</h4>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Kode Tag</dt>
                  <dd className="font-mono">
                    {stampPreview.metadata.tag.code}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Produk</dt>
                  <dd>{stampPreview.metadata.products.length} produk</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">URL Verifikasi</dt>
                  <dd className="truncate max-w-[200px] font-mono text-xs">
                    {stampPreview.metadata.verification.verify_url}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-3 font-medium">Produk yang Disertakan</h4>
              <ul className="space-y-2">
                {stampPreview.metadata.products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{product.name}</span>
                    <span className="text-muted-foreground">
                      {product.brand.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">Yang akan terjadi:</p>
              <ul className="mt-2 list-inside list-disc text-muted-foreground">
                <li>Kode QR akan dibuat dan diunggah</li>
                <li>JSON metadata statis akan dibuat</li>
                <li>Tag akan dicatat di blockchain</li>
                <li>Konten tag menjadi tidak dapat diubah</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <DialogFooter>
          {!stampResult?.success && (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isStamping}
              >
                Batal
              </Button>
              {stampPreview?.canStamp && (
                <Button onClick={onConfirmStamp} disabled={isStamping}>
                  {isStamping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mencap...
                    </>
                  ) : (
                    <>
                      <Stamp className="mr-2 h-4 w-4" />
                      Konfirmasi & Cap
                    </>
                  )}
                </Button>
              )}
            </>
          )}
          {stampResult?.success && (
            <Button onClick={handleClose}>Selesai</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
