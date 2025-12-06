'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Smartphone, Zap } from 'lucide-react';

const MotionDiv = motion.div;

export function Features() {
  return (
    <section className="relative z-10 py-16 sm:py-24 space-y-16">
      {/* Feature 1 - Analytics */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <MotionDiv
            className="order-2 lg:order-1 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {/* Simplified background - reduced blur */}
            <div className="absolute inset-0 bg-linear-to-br from-[#2B4C7E]/20 to-[#1E3A5F]/10 rounded-3xl transform rotate-3 scale-95 blur-xl" />
            <div className="relative bg-white border-2 border-[#2B4C7E]/20 rounded-2xl shadow-xl overflow-hidden p-2">
              <div className="bg-white rounded-xl p-4 h-[200px] sm:h-[260px] flex items-center justify-center border border-[#A8A8A8]/20">
                <Image
                  src="/feature-analytics.png"
                  alt="Real-time Analytics Dashboard"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain max-h-full"
                />
              </div>
            </div>
          </MotionDiv>
          <MotionDiv
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center rounded-full bg-[#2B4C7E]/10 px-4 py-1.5 text-sm font-semibold text-[#0C2340] mb-4 border border-[#2B4C7E]/20">
              <Zap className="mr-2 h-4 w-4 text-[#2B4C7E]" />
              Wawasan Real-time
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0C2340] mb-4">
              Keputusan berbasis data untuk rantai pasokan Anda.
            </h2>
            <p className="text-base text-[#808080] mb-6 leading-relaxed">
              Dapatkan visibilitas di mana produk Anda dipindai. Deteksi
              aktivitas mencurigakan secara real-time.
            </p>
            <ul className="space-y-3">
              {['Pelacakan scan geospasial', 'Peringatan upaya pemalsuan'].map(
                (item, i) => (
                  <li key={i} className="flex items-center text-[#0C2340]">
                    <CheckCircle2 className="h-5 w-5 text-[#2B4C7E] mr-3 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </li>
                )
              )}
            </ul>
          </MotionDiv>
        </div>
      </div>

      {/* Feature 2 - Scanning */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <MotionDiv
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center rounded-full bg-[#A8A8A8]/20 px-4 py-1.5 text-sm font-semibold text-[#0C2340] mb-4 border border-[#A8A8A8]/30">
              <Smartphone className="mr-2 h-4 w-4 text-[#1E3A5F]" />
              Tanpa Aplikasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0C2340] mb-4">
              Cukup arahkan dan scan.
            </h2>
            <p className="text-base text-[#808080] mb-6 leading-relaxed">
              Scanner berbasis web kami bekerja langsung di browser, memastikan
              tingkat adopsi yang tinggi tanpa hambatan.
            </p>
            <ul className="space-y-3">
              {['Verifikasi instan', 'Tanpa download'].map((item, i) => (
                <li key={i} className="flex items-center text-[#0C2340]">
                  <CheckCircle2 className="h-5 w-5 text-[#2B4C7E] mr-3 shrink-0" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </MotionDiv>
          <MotionDiv
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {/* Simplified background - reduced blur */}
            <div className="absolute inset-0 bg-linear-to-br from-[#A8A8A8]/20 to-[#2B4C7E]/10 rounded-3xl transform -rotate-3 scale-95 blur-xl" />
            <div className="relative bg-white border-2 border-[#A8A8A8]/30 rounded-2xl shadow-xl overflow-hidden p-2">
              <div className="bg-white rounded-xl p-4 h-[200px] sm:h-[260px] flex items-center justify-center border border-[#A8A8A8]/20">
                <Image
                  src="/feature-scanning.png"
                  alt="Mobile QR Code Scanning"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain max-h-full"
                />
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>

      {/* Feature 3 - Blockchain Security */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <MotionDiv
            className="order-2 lg:order-1 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {/* Simplified background - reduced blur */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1E3A5F]/20 to-[#0C2340]/10 rounded-3xl transform rotate-2 scale-95 blur-xl" />
            <div className="relative bg-white border-2 border-[#1E3A5F]/20 rounded-2xl shadow-xl overflow-hidden p-2">
              <div className="bg-white rounded-xl p-4 h-[200px] sm:h-[260px] flex items-center justify-center border border-[#1E3A5F]/20">
                <Image
                  src="/feature-security.png"
                  alt="Blockchain Security"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain max-h-full"
                />
              </div>
            </div>
          </MotionDiv>
          <MotionDiv
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center rounded-full bg-[#0C2340]/10 px-4 py-1.5 text-sm font-semibold text-[#0C2340] mb-4 border border-[#0C2340]/20">
              <Lock className="mr-2 h-4 w-4 text-[#0C2340]" />
              Keamanan Blockchain
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0C2340] mb-4">
              Catatan permanen dan anti-rusak.
            </h2>
            <p className="text-base text-[#808080] mb-6 leading-relaxed">
              Setiap tag produk dicetak sebagai aset digital di blockchain,
              menciptakan catatan provenance yang tidak dapat dipalsukan.
            </p>
            <div className="flex gap-4">
              {/* CSS hover instead of framer-motion */}
              <div className="bg-linear-to-br from-white to-[#2B4C7E]/5 border-2 border-[#2B4C7E]/20 rounded-xl p-4 shadow-lg flex-1 transition-transform duration-200 hover:scale-[1.02]">
                <div className="text-2xl font-bold text-[#0C2340] mb-1">
                  99.9%
                </div>
                <div className="text-sm text-[#808080] font-medium">Uptime</div>
              </div>
              <div className="bg-linear-to-br from-white to-[#2B4C7E]/5 border-2 border-[#2B4C7E]/20 rounded-xl p-4 shadow-lg flex-1 transition-transform duration-200 hover:scale-[1.02]">
                <div className="text-2xl font-bold text-[#0C2340] mb-1">
                  &lt;1dtk
                </div>
                <div className="text-sm text-[#808080] font-medium">
                  Verifikasi
                </div>
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
