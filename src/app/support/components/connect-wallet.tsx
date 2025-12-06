'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Wallet,
  ShieldCheck,
  MessageSquare,
  Package,
  Headphones,
} from 'lucide-react';

interface ConnectWalletProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function ConnectWallet({ onConnect, isConnecting }: ConnectWalletProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white">
      {/* Header */}
      <header className="border-b border-[#A8A8A8]/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-[#0C2340]"
            >
              Etags
            </Link>
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full px-6 shadow-lg shadow-[#2B4C7E]/30"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? 'Menghubungkan...' : 'Hubungkan Wallet'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#2B4C7E]/10 rounded-full px-4 py-2 mb-6">
            <Headphones className="w-4 h-4 text-[#2B4C7E]" />
            <span className="text-sm font-medium text-[#2B4C7E]">
              Dukungan Pelanggan Web3
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0C2340] mb-6 leading-tight">
            Pusat Bantuan
          </h1>
          <p className="text-lg text-[#808080] mb-10 max-w-2xl mx-auto">
            Hubungkan wallet Anda untuk mengakses dukungan produk terverifikasi.
            Ajukan tiket langsung ke brand dan pantau masalah Anda secara
            real-time.
          </p>

          <Card className="max-w-md mx-auto border-[#2B4C7E]/20 shadow-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-[#2B4C7E]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0C2340] mb-2">
                Hubungkan Wallet Anda
              </h3>
              <p className="text-[#808080] mb-6 text-sm">
                Wallet Anda adalah identitas Anda. Hubungkan untuk melihat
                produk dan mengajukan tiket dukungan.
              </p>
              <Button
                onClick={onConnect}
                disabled={isConnecting}
                size="lg"
                className="w-full bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full shadow-lg shadow-[#2B4C7E]/30"
              >
                {isConnecting ? 'Menghubungkan...' : 'Hubungkan Wallet'}
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-[#2B4C7E]" />
              </div>
              <h3 className="font-semibold text-[#0C2340] mb-2">
                Kepemilikan Terverifikasi
              </h3>
              <p className="text-sm text-[#808080]">
                NFT Anda membuktikan kepemilikan produk untuk dukungan asli
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-[#2B4C7E]" />
              </div>
              <h3 className="font-semibold text-[#0C2340] mb-2">
                Komunikasi Langsung
              </h3>
              <p className="text-sm text-[#808080]">
                Berbicara langsung dengan tim dukungan brand
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-[#2B4C7E]" />
              </div>
              <h3 className="font-semibold text-[#0C2340] mb-2">
                Riwayat Produk
              </h3>
              <p className="text-sm text-[#808080]">
                Pelacakan lengkap untuk garansi dan klaim
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
