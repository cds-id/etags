'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Box, Globe } from 'lucide-react';

const MotionDiv = motion.div;

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#A8A8A8]/30 bg-white/80 backdrop-blur-sm pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/logo.png"
                  alt="Etags Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-[#0C2340]">Etags</span>
            </div>
            <p className="text-[#808080] text-sm max-w-xs mb-6 leading-relaxed">
              Standar untuk verifikasi produk berbasis blockchain. Aman,
              scalable, dan sederhana.
            </p>
            <div className="flex gap-3">
              <MotionDiv
                className="w-9 h-9 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center text-[#2B4C7E] hover:bg-[#2B4C7E] hover:text-white transition-all cursor-pointer shadow-sm"
                whileHover={{ scale: 1.1 }}
              >
                <Globe className="w-4 h-4" />
              </MotionDiv>
              <MotionDiv
                className="w-9 h-9 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center text-[#2B4C7E] hover:bg-[#2B4C7E] hover:text-white transition-all cursor-pointer shadow-sm"
                whileHover={{ scale: 1.1 }}
              >
                <Box className="w-4 h-4" />
              </MotionDiv>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#0C2340] mb-4">Produk</h4>
            <ul className="space-y-2 text-sm text-[#808080]">
              <li>
                <Link
                  href="/features"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Fitur
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Harga
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/showcase"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Showcase
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#0C2340] mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-[#808080]">
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Tentang
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Karir
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#0C2340] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-[#808080]">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Syarat
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="hover:text-[#2B4C7E] transition-colors"
                >
                  Keamanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#A8A8A8]/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#808080]">
            &copy; {new Date().getFullYear()} Etags Inc. Hak cipta dilindungi
            undang-undang.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#808080]">
            <MotionDiv
              className="w-2 h-2 rounded-full bg-[#2B4C7E]"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Sistem Operasional
          </div>
        </div>
      </div>
    </footer>
  );
}
