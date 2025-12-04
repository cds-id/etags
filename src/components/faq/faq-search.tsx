'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FAQSearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
};

export function FAQSearch({ value, onChange, resultCount }: FAQSearchProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Cari pertanyaan atau kata kunci..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 pr-12 h-14 text-base rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Hapus pencarian</span>
          </Button>
        )}
      </div>
      {value && resultCount !== undefined && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center">
          {resultCount > 0
            ? `Ditemukan ${resultCount} hasil untuk "${value}"`
            : `Tidak ada hasil untuk "${value}"`}
        </p>
      )}
    </div>
  );
}
