import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2,
  Smartphone,
  LogIn,
  Gift,
  BarChart3,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Panduan Juri - Etags IMPHNEN 2025',
  description: 'Panduan cepat untuk juri hackathon IMPHNEN 2025',
};

export default function JudgeGuidePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-[#2B4C7E]/5 to-white">
      {/* Header */}
      <header className="border-b border-[#A8A8A8]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Etags Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-bold text-[#0C2340]">Etags</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#2B4C7E] text-white px-2 py-1 rounded-full font-medium">
              IMPHNEN 2025
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-4">
            Selamat Datang, Juri! 👋
          </h1>
          <p className="text-[#606060] text-lg max-w-2xl mx-auto">
            Panduan singkat untuk mencoba fitur utama Etags - Platform
            Verifikasi Produk Berbasis Blockchain
          </p>
        </div>

        {/* Quick Start Steps */}
        <div className="space-y-8">
          {/* Step 1: Scan QR */}
          <div className="bg-white rounded-2xl border-2 border-[#2B4C7E]/20 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#2B4C7E] flex items-center justify-center text-white font-bold text-lg shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-[#2B4C7E]" />
                  <h2 className="text-xl font-bold text-[#0C2340]">
                    Scan Tag & Klaim NFT
                  </h2>
                </div>
                <p className="text-[#606060] mb-4">
                  Scan QR code produk untuk memverifikasi keaslian dan klaim NFT
                  koleksi Anda sebagai pemilik pertama.
                </p>

                {/* QR Code Display */}
                <div className="bg-[#2B4C7E]/5 rounded-xl p-6 border border-[#2B4C7E]/20">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-xl shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://tags.cylink.site/api/tags/TAG-1764985700713-X8GZPS/designed"
                        alt="QR Code untuk Juri"
                        width={150}
                        height={150}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="font-semibold text-[#0C2340] mb-2">
                        Tag Khusus Juri
                      </p>
                      <p className="text-sm text-[#606060] mb-3">
                        Scan dengan kamera HP atau klik tombol di bawah
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#2B4C7E] hover:bg-[#1E3A5F]"
                        >
                          <Link href="/verify/TAG-1764985700713-X8GZPS">
                            Buka Halaman Verifikasi
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/scan">Buka Scanner</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Tips:</strong> Untuk klaim NFT, gunakan browser
                    dengan MetaMask dan hubungkan ke jaringan Base Sepolia. Gas
                    fee ditanggung sistem!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Login Dashboard */}
          <div className="bg-white rounded-2xl border-2 border-[#2B4C7E]/20 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-lg shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LogIn className="w-5 h-5 text-[#1E3A5F]" />
                  <h2 className="text-xl font-bold text-[#0C2340]">
                    Login ke Dashboard
                  </h2>
                </div>
                <p className="text-[#606060] mb-4">
                  Akses dashboard untuk melihat manajemen brand, produk, tag,
                  dan analitik.
                </p>

                {/* Credentials */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#0C2340]">
                        Admin
                      </span>
                      <span className="px-2 py-0.5 bg-[#2B4C7E] text-white rounded text-xs font-medium">
                        ADMIN
                      </span>
                    </div>
                    <p className="text-sm text-[#606060] font-mono">
                      admin@example.com
                    </p>
                    <p className="text-sm text-[#606060] font-mono">admin123</p>
                  </div>
                  <div className="p-4 bg-[#1E3A5F]/5 rounded-xl border border-[#1E3A5F]/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#0C2340]">
                        Brand (Juri)
                      </span>
                      <span className="px-2 py-0.5 bg-[#1E3A5F] text-white rounded text-xs font-medium">
                        BRAND
                      </span>
                    </div>
                    <p className="text-sm text-[#606060] font-mono">
                      judge@hackathon.imphnen.dev
                    </p>
                    <p className="text-sm text-[#606060] font-mono">
                      IMPHNEN2025
                    </p>
                  </div>
                </div>

                <Button asChild className="bg-[#2B4C7E] hover:bg-[#1E3A5F]">
                  <Link href="/login">
                    Login Sekarang
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Explore Features */}
          <div className="bg-white rounded-2xl border-2 border-[#2B4C7E]/20 p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0C2340] flex items-center justify-center text-white font-bold text-lg shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-[#0C2340]" />
                  <h2 className="text-xl font-bold text-[#0C2340]">
                    Jelajahi Fitur
                  </h2>
                </div>
                <p className="text-[#606060] mb-4">
                  Coba berbagai fitur yang tersedia di platform Etags.
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Link
                    href="/manage"
                    className="flex items-center gap-3 p-3 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/20 hover:bg-[#2B4C7E]/10 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-[#2B4C7E]" />
                    <div>
                      <p className="font-medium text-[#0C2340]">Dashboard</p>
                      <p className="text-xs text-[#606060]">
                        Statistik & analitik
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/manage/tags"
                    className="flex items-center gap-3 p-3 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/20 hover:bg-[#2B4C7E]/10 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E]" />
                    <div>
                      <p className="font-medium text-[#0C2340]">
                        Tag Management
                      </p>
                      <p className="text-xs text-[#606060]">
                        Kelola tag produk
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/manage/nfts"
                    className="flex items-center gap-3 p-3 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/20 hover:bg-[#2B4C7E]/10 transition-colors"
                  >
                    <Gift className="w-5 h-5 text-[#2B4C7E]" />
                    <div>
                      <p className="font-medium text-[#0C2340]">
                        NFT Collectibles
                      </p>
                      <p className="text-xs text-[#606060]">
                        Monitor NFT yang diklaim
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/support"
                    className="flex items-center gap-3 p-3 bg-[#2B4C7E]/5 rounded-xl border border-[#2B4C7E]/20 hover:bg-[#2B4C7E]/10 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-[#2B4C7E]" />
                    <div>
                      <p className="font-medium text-[#0C2340]">Web3 Support</p>
                      <p className="text-xs text-[#606060]">
                        Tiket support via wallet
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#606060] mb-4">Dibangun dengan</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Next.js 16',
              'React 19',
              'TypeScript',
              'Prisma',
              'Base Sepolia',
              'ethers.js',
              'Tailwind CSS',
              'shadcn/ui',
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-[#2B4C7E]/10 text-[#0C2340] rounded-full text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mt-8 text-center p-6 bg-[#2B4C7E]/5 rounded-2xl border border-[#2B4C7E]/20">
          <p className="text-sm font-semibold text-[#0C2340] mb-2">
            Tim: Pemuja Deadline Anti Refund
          </p>
          <p className="text-xs text-[#606060]">IMPHNEN Hackathon 2025</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#A8A8A8]/20 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-[#606060]">
            &copy; 2025 Etags - Product Tagging & Blockchain Stamping Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
