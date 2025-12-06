'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Wallet } from 'lucide-react';

interface SupportHeaderProps {
  walletAddress: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function SupportHeader({
  walletAddress,
  showBack = false,
  onBack,
}: SupportHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#A8A8A8]/20 py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left side: Back button or Logo */}
        <div className="flex items-center gap-3">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-2 text-[#0C2340] hover:bg-[#A8A8A8]/10 rounded-lg transition-colors -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Image
                src="/logo.png"
                alt="Etags Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0C2340]">
              Etags
            </span>
          </Link>
        </div>

        {/* Right side: Wallet address */}
        <div className="flex items-center gap-2 bg-[#A8A8A8]/10 px-3 py-1.5 rounded-full">
          <Wallet className="h-4 w-4 text-[#2B4C7E]" />
          <span className="text-sm font-medium text-[#1E3A5F]">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
      </div>
    </header>
  );
}
