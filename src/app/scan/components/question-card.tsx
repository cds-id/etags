'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, HelpCircle } from 'lucide-react';
import type { LocationData } from './constants';

type QuestionCardProps = {
  question: {
    type: string;
    message: string;
    options?: string[];
  };
  location: LocationData | null;
  claimLoading: boolean;
  onClaim: (isFirstHand: boolean, sourceInfo?: string) => void;
  onRequestLocation: () => void;
};

export function QuestionCard({
  question,
  location,
  claimLoading,
  onClaim,
  onRequestLocation,
}: QuestionCardProps) {
  if (question.type === 'no_question') return null;

  return (
    <Card className="mb-6 border-2 border-[#2B4C7E]/20 bg-linear-to-br from-[#2B4C7E]/10 via-[#2B4C7E]/5 to-transparent shadow-lg shadow-[#2B4C7E]/10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#2B4C7E]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-[#2B4C7E] to-[#1E3A5F] flex items-center justify-center shadow-md shadow-[#2B4C7E]/20">
            <HelpCircle className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-[#0C2340]">Pertanyaan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {/* Location required warning */}
        {!location && (
          <div className="mb-4 rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Lokasi Diperlukan
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Untuk menjawab pertanyaan kepemilikan, Anda harus mengizinkan
                  akses lokasi. Data lokasi diperlukan untuk memastikan data
                  yang bersih dan mencegah penyalahgunaan.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-amber-400 text-amber-800 hover:bg-amber-100"
                  onClick={onRequestLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Izinkan Lokasi
                </Button>
              </div>
            </div>
          </div>
        )}

        <p className="mb-4 text-[#0C2340]">{question.message}</p>
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left border-[#2B4C7E]/30 hover:bg-[#2B4C7E]/10 hover:border-[#2B4C7E]/50 text-[#0C2340]"
              disabled={claimLoading || !location}
              onClick={() => {
                const isFirstHand =
                  option.toLowerCase().includes('pertama') ||
                  option.toLowerCase().includes('pemilik pertama');
                onClaim(isFirstHand, option);
              }}
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Show message when buttons are disabled */}
        {!location && (
          <p className="mt-3 text-xs text-[#808080] text-center">
            Tombol di atas akan aktif setelah Anda mengizinkan akses lokasi
          </p>
        )}
      </CardContent>
    </Card>
  );
}
