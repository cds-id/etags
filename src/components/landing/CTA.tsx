'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const MotionDiv = motion.div;

export function CTA() {
  return (
    <section className="relative z-10 py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <MotionDiv
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0C2340] via-[#1E3A5F] to-[#2B4C7E] px-6 py-16 sm:px-16 sm:py-24 text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Animated background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <MotionDiv
              className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[#2B4C7E] blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <MotionDiv
              className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[#A8A8A8] blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -50, 0],
              }}
              transition={{ duration: 12, repeat: Infinity }}
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
              Siap modernisasi verifikasi produk Anda?
            </h2>
            <p className="text-[#A8A8A8] mb-10 text-lg">
              Bergabunglah dengan merek visioner yang menggunakan Etags untuk
              mengamankan pendapatan dan membangun kepercayaan pelanggan yang
              langgeng.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-white text-[#0C2340] hover:bg-[#A8A8A8]/20 hover:text-white h-12 px-8 rounded-full font-semibold shadow-xl"
              >
                <Link href="/register">Buat Akun</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-2 border-white/30 text-white hover:text-white hover:bg-white/10 hover:border-white/50 h-12 px-8 rounded-full bg-transparent font-semibold"
              >
                <Link href="/docs">Baca Dokumentasi</Link>
              </Button>
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
