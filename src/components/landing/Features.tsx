'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const MotionDiv = motion.div;

export function Features() {
  return (
    <section className="relative z-10 py-20 sm:py-32 space-y-24">
      {/* Feature 1 */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <MotionDiv
            className="order-2 lg:order-1 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#2B4C7E]/30 to-[#1E3A5F]/20 rounded-3xl transform rotate-3 scale-95 blur-2xl" />
            <div className="relative bg-white border-2 border-[#2B4C7E]/20 rounded-2xl shadow-2xl shadow-[#2B4C7E]/20 overflow-hidden p-2">
              <div className="bg-linear-to-br from-[#2B4C7E]/5 to-white rounded-xl p-6 h-[300px] sm:h-[400px] flex items-center justify-center border border-[#A8A8A8]/20">
                <Image
                  src="/feature-analytics.png"
                  alt="Real-time Analytics Dashboard"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </MotionDiv>
          <MotionDiv
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full bg-[#2B4C7E]/10 px-4 py-1.5 text-sm font-semibold text-[#0C2340] mb-6 border border-[#2B4C7E]/20">
              <Zap className="mr-2 h-4 w-4 text-[#2B4C7E]" />
              Wawasan Real-time
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-6">
              Keputusan berbasis data untuk rantai pasokan Anda.
            </h2>
            <p className="text-lg text-[#808080] mb-8 leading-relaxed">
              Dapatkan visibilitas di mana produk Anda dipindai. Deteksi
              aktivitas pasar gelap dan hotspot pemalsuan potensial secara
              real-time dengan dashboard canggih kami.
            </p>
            <ul className="space-y-4">
              {[
                'Pelacakan scan geospasial',
                'Peringatan upaya pemalsuan',
                'Metrik kecepatan rantai pasokan',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center text-[#0C2340]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-[#2B4C7E] mr-3 shrink-0" />
                  <span className="font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>
          </MotionDiv>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <MotionDiv
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full bg-[#A8A8A8]/20 px-4 py-1.5 text-sm font-semibold text-[#0C2340] mb-6 border border-[#A8A8A8]/30">
              <Smartphone className="mr-2 h-4 w-4 text-[#1E3A5F]" />
              Pengalaman Mulus
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-6">
              Tanpa aplikasi. Cukup arahkan dan scan.
            </h2>
            <p className="text-lg text-[#808080] mb-8 leading-relaxed">
              Hilangkan hambatan dalam proses verifikasi. Scanner berbasis web
              kami bekerja langsung di browser, memastikan tingkat adopsi yang
              tinggi di kalangan pelanggan Anda.
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-[#2B4C7E] font-semibold text-lg hover:text-[#1E3A5F]"
            >
              Lihat demo <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </MotionDiv>
          <MotionDiv
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#A8A8A8]/30 to-[#2B4C7E]/20 rounded-3xl transform -rotate-3 scale-95 blur-2xl" />
            <div className="relative bg-white border-2 border-[#A8A8A8]/30 rounded-2xl shadow-2xl shadow-[#A8A8A8]/20 overflow-hidden p-2">
              <div className="bg-linear-to-br from-white to-[#A8A8A8]/5 rounded-xl p-6 h-[300px] sm:h-[400px] flex items-center justify-center border border-[#A8A8A8]/20">
                <Image
                  src="/feature-scanning.png"
                  alt="Mobile QR Code Scanning"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>

      {/* Feature 3 */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <MotionDiv
            className="order-2 lg:order-1 relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-[#1E3A5F]/30 to-[#0C2340]/20 rounded-3xl transform rotate-2 scale-95 blur-2xl" />
            <div className="relative bg-white border-2 border-[#1E3A5F]/20 rounded-2xl shadow-2xl shadow-[#0C2340]/20 overflow-hidden p-2">
              <div className="bg-linear-to-br from-[#0C2340]/5 to-white rounded-xl p-6 h-[300px] sm:h-[400px] flex items-center justify-center border border-[#1E3A5F]/20">
                <Image
                  src="/feature-security.png"
                  alt="Blockchain Security"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </MotionDiv>
          <MotionDiv
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center rounded-full bg-[#0C2340]/10 px-4 py-1.5 text-sm font-semibold text-[#0C2340] mb-6 border border-[#0C2340]/20">
              <Lock className="mr-2 h-4 w-4 text-[#0C2340]" />
              Keamanan Tingkat Bank
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-6">
              Catatan permanen di Blockchain.
            </h2>
            <p className="text-lg text-[#808080] mb-8 leading-relaxed">
              Setiap tag produk dicetak sebagai aset digital di distributed
              ledger. Ini menciptakan catatan provenance yang permanen dan
              anti-rusak yang tidak dapat dipalsukan.
            </p>
            <div className="flex gap-4">
              <MotionDiv
                className="bg-linear-to-br from-white to-[#2B4C7E]/5 border-2 border-[#2B4C7E]/20 rounded-xl p-5 shadow-lg flex-1"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[#0C2340] mb-1">
                  99.9%
                </div>
                <div className="text-sm text-[#808080] font-medium">Uptime</div>
              </MotionDiv>
              <MotionDiv
                className="bg-linear-to-br from-white to-[#2B4C7E]/5 border-2 border-[#2B4C7E]/20 rounded-xl p-5 shadow-lg flex-1"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-[#0C2340] mb-1">
                  &lt;1dtk
                </div>
                <div className="text-sm text-[#808080] font-medium">
                  Waktu Verifikasi
                </div>
              </MotionDiv>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
