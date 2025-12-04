'use client';

import Link from 'next/link';
import { Wallet } from 'lucide-react';

interface SupportHeaderProps {
  walletAddress: string;
}

export function SupportHeader({ walletAddress }: SupportHeaderProps) {
  return (
    <header className="border-b border-[#A8A8A8]/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#0C2340]"
          >
            Etags
          </Link>
          <div className="flex items-center gap-2 text-sm text-[#808080]">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
