'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Scan, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

export function Hero() {
  return (
    <section className="relative z-10 pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <MotionDiv
              className="inline-flex items-center rounded-full border border-[#2B4C7E]/20 bg-[#2B4C7E]/10 px-4 py-1.5 text-sm text-[#0C2340] mb-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles className="mr-2 h-4 w-4 text-[#2B4C7E]" />
              <span className="font-semibold">
                Teknologi Blockchain Terdepan
              </span>
            </MotionDiv>

            <MotionH1
              className="mb-6 text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#0C2340] leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Keaslian Produk,{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#2B4C7E] via-[#1E3A5F] to-[#0C2340]">
                Terjamin.
              </span>
            </MotionH1>

            <MotionP
              className="mb-10 text-lg text-[#606060] leading-relaxed max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              Amankan rantai pasokan Anda dengan teknologi distributed ledger
              yang transparan dan tidak dapat dipalsukan. Berikan kepercayaan
              penuh kepada pelanggan Anda.
            </MotionP>

            <MotionDiv
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto h-12 px-8 bg-[#2B4C7E] text-white hover:bg-[#1E3A5F] shadow-xl shadow-[#2B4C7E]/40 rounded-full text-base font-semibold"
              >
                <Link href="/register">Mulai Integrasi</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-12 px-8 border-2 border-[#2B4C7E] bg-white/80 hover:bg-[#2B4C7E]/5 text-[#0C2340] hover:text-[#0C2340] rounded-full text-base font-semibold"
              >
                <Link href="/scan">
                  <Scan className="mr-2 h-5 w-5" />
                  Coba Scanner
                </Link>
              </Button>
            </MotionDiv>
          </div>

          {/* Hero Illustration - Static, no infinite animation */}
          <MotionDiv
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative w-full max-w-[480px] mx-auto">
              {/* Background Glow - reduced blur */}
              <div className="absolute inset-0 bg-linear-to-br from-[#2B4C7E]/10 to-[#1E3A5F]/5 rounded-full blur-2xl" />

              {/* Hero Image - no animation, CSS hover only */}
              <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="/hero-illustration.png"
                  alt="Blockchain Product Authentication"
                  width={600}
                  height={600}
                  className="w-full h-auto drop-shadow-xl"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
