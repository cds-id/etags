'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin } from 'lucide-react';
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
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-800">Pertanyaan</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Location required warning */}
        {!location && (
          <div className="mb-4 rounded-lg bg-yellow-100 border border-yellow-300 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Lokasi Diperlukan
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Untuk menjawab pertanyaan kepemilikan, Anda harus mengizinkan
                  akses lokasi. Data lokasi diperlukan untuk memastikan data
                  yang bersih dan mencegah penyalahgunaan.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-yellow-400 text-yellow-800 hover:bg-yellow-200"
                  onClick={onRequestLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Izinkan Lokasi
                </Button>
              </div>
            </div>
          </div>
        )}

        <p className="mb-4 text-blue-700">{question.message}</p>
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left"
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
          <p className="mt-3 text-xs text-gray-500 text-center">
            Tombol di atas akan aktif setelah Anda mengizinkan akses lokasi
          </p>
        )}
      </CardContent>
    </Card>
  );
}
