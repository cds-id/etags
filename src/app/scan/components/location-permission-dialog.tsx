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
      <DialogContent className="max-w-sm border-[#2B4C7E]/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0C2340]">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-md shadow-[#2B4C7E]/20">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            Izin Lokasi
          </DialogTitle>
          <DialogDescription className="text-[#808080]">
            Kami membutuhkan akses lokasi Anda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl bg-[#2B4C7E]/5 border border-[#2B4C7E]/20 p-4">
            <h4 className="mb-2 font-medium text-[#0C2340] flex items-center gap-2">
              <Info className="h-4 w-4 text-[#2B4C7E]" />
              Mengapa kami membutuhkan lokasi?
            </h4>
            <ul className="space-y-2 text-sm text-[#0C2340]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#2B4C7E]" />
                <span>
                  <strong>Deteksi Pemalsuan:</strong> Membantu mengidentifikasi
                  pola distribusi produk palsu berdasarkan lokasi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#2B4C7E]" />
                <span>
                  <strong>Verifikasi Keaslian:</strong> Memastikan produk
                  didistribusikan melalui jalur resmi
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#2B4C7E]" />
                <span>
                  <strong>Perlindungan Konsumen:</strong> Membantu brand melacak
                  dan menindak penjual produk palsu
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#A8A8A8]/30 p-3 text-xs text-[#808080]">
            <p>
              <strong className="text-[#0C2340]">Privasi Anda terjaga:</strong>{' '}
              Data lokasi hanya digunakan untuk verifikasi produk dan tidak akan
              dibagikan ke pihak ketiga.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onConfirm}
            className="w-full gap-2 bg-linear-to-r from-[#2B4C7E] to-[#1E3A5F] hover:from-[#1E3A5F] hover:to-[#0C2340] shadow-lg shadow-[#2B4C7E]/30"
          >
            <MapPin className="h-4 w-4" />
            Izinkan Akses Lokasi
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-[#808080] hover:text-[#0C2340] hover:bg-[#2B4C7E]/5"
          >
            Lewati
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
