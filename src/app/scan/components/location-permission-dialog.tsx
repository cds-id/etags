'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, MapPin, ShieldCheck } from 'lucide-react';

type LocationPermissionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onSkip: () => void;
};

export function LocationPermissionDialog({
  open,
  onOpenChange,
  onConfirm,
  onSkip,
}: LocationPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Izin Lokasi
          </DialogTitle>
          <DialogDescription>
            Kami membutuhkan akses lokasi Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Mengapa kami membutuhkan lokasi?
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Deteksi Pemalsuan:</strong> Membantu mengidentifikasi
                  pola distribusi produk palsu berdasarkan lokasi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Verifikasi Keaslian:</strong> Memastikan produk
                  didistribusikan melalui jalur resmi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Perlindungan Konsumen:</strong> Membantu brand melacak
                  dan menindak penjual produk palsu
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 text-xs text-gray-600">
            <p>
              <strong>Privasi Anda terjaga:</strong> Data lokasi hanya digunakan
              untuk verifikasi produk dan tidak akan dibagikan ke pihak ketiga.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onConfirm} className="w-full gap-2">
            <MapPin className="h-4 w-4" />
            Izinkan Akses Lokasi
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Lewati
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
