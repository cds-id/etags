'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, AlertCircle, Inbox } from 'lucide-react';

interface StatsCardsProps {
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  totalCount: number;
}

export function StatsCards({
  openCount,
  inProgressCount,
  resolvedCount,
  totalCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <Card className="border-0 shadow-sm bg-linear-to-br from-amber-50 to-amber-100/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                Dibuka
              </p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {openCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-200/50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm bg-linear-to-br from-blue-50 to-blue-100/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                Diproses
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {inProgressCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-200/50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm bg-linear-to-br from-emerald-50 to-emerald-100/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                Selesai
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {resolvedCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-200/50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm bg-linear-to-br from-gray-50 to-gray-100/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {totalCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
