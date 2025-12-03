'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MotionDiv = motion.div;

export function Industries() {
  return (
    <section className="relative z-10 py-20 bg-linear-to-b from-white to-[#A8A8A8]/10 border-y border-[#A8A8A8]/30">
      <div className="container mx-auto px-4 sm:px-6">
        <MotionDiv
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-[#0C2340] mb-4">
            Disesuaikan untuk industri Anda
          </h2>
          <p className="text-[#808080] text-lg">
            Etags beradaptasi dengan kebutuhan unik berbagai kategori produk.
          </p>
        </MotionDiv>

        <Tabs defaultValue="fashion" className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-12 overflow-x-auto pb-4 sm:pb-0">
            <TabsList className="bg-white/80 backdrop-blur-sm border-2 border-[#2B4C7E]/20 p-1.5 rounded-full shadow-lg flex-nowrap">
              <TabsTrigger
                value="fashion"
                className="rounded-full px-6 sm:px-8 py-2.5 data-[state=active]:bg-[#2B4C7E] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2B4C7E]/30 font-semibold whitespace-nowrap"
              >
                Fashion
              </TabsTrigger>
              <TabsTrigger
                value="electronics"
                className="rounded-full px-6 sm:px-8 py-2.5 data-[state=active]:bg-[#2B4C7E] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2B4C7E]/30 font-semibold whitespace-nowrap"
              >
                Elektronik
              </TabsTrigger>
              <TabsTrigger
                value="pharma"
                className="rounded-full px-6 sm:px-8 py-2.5 data-[state=active]:bg-[#2B4C7E] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2B4C7E]/30 font-semibold whitespace-nowrap"
              >
                Farmasi
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fashion" className="mt-0">
            <MotionDiv
              className="bg-white rounded-2xl p-8 border-2 border-[#2B4C7E]/20 shadow-xl shadow-[#2B4C7E]/10 flex flex-col md:flex-row gap-8 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#0C2340] mb-4">
                  Lindungi Edisi Terbatas
                </h3>
                <p className="text-[#808080] mb-6 leading-relaxed">
                  Verifikasi keaslian barang mewah dan produk edisi terbatas.
                  Aktifkan transfer kepemilikan digital untuk pasar resale.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-[#0C2340] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E] mr-2" />
                    Sertifikat Keaslian Digital
                  </li>
                  <li className="flex items-center text-sm text-[#0C2340] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E] mr-2" />
                    Pelacakan Royalti Resale
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-1/3 aspect-square bg-linear-to-br from-[#2B4C7E]/10 to-white rounded-xl flex items-center justify-center border-2 border-[#2B4C7E]/20 overflow-hidden p-4">
                <Image
                  src="/industry-fashion.png"
                  alt="Fashion Authentication"
                  width={300}
                  height={300}
                  className="w-full h-auto object-contain"
                />
              </div>
            </MotionDiv>
          </TabsContent>

          <TabsContent value="electronics" className="mt-0">
            <MotionDiv
              className="bg-white rounded-2xl p-8 border-2 border-[#2B4C7E]/20 shadow-xl shadow-[#2B4C7E]/10 flex flex-col md:flex-row gap-8 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#0C2340] mb-4">
                  Garansi & Registrasi
                </h3>
                <p className="text-[#808080] mb-6 leading-relaxed">
                  Sederhanakan registrasi garansi dengan satu scan. Lacak
                  provenance komponen dan riwayat perbaikan.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-[#0C2340] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E] mr-2" />
                    Aktivasi Garansi Satu-Tap
                  </li>
                  <li className="flex items-center text-sm text-[#0C2340] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E] mr-2" />
                    Transparansi Rantai Pasokan
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-1/3 aspect-square bg-linear-to-br from-[#2B4C7E]/10 to-white rounded-xl flex items-center justify-center border-2 border-[#2B4C7E]/20 overflow-hidden p-4">
                <Image
                  src="/industry-electronics.png"
                  alt="Electronics Warranty"
                  width={300}
                  height={300}
                  className="w-full h-auto object-contain"
                />
              </div>
            </MotionDiv>
          </TabsContent>

          <TabsContent value="pharma" className="mt-0">
            <MotionDiv
              className="bg-white rounded-2xl p-8 border-2 border-[#2B4C7E]/20 shadow-xl shadow-[#2B4C7E]/10 flex flex-col md:flex-row gap-8 items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#0C2340] mb-4">
                  Keselamatan Pasien Utama
                </h3>
                <p className="text-[#808080] mb-6 leading-relaxed">
                  Lawan obat palsu. Izinkan pasien memverifikasi tanggal
                  kedaluwarsa dan nomor batch secara instan.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-[#0C2340] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E] mr-2" />
                    Pelacakan Batch
                  </li>
                  <li className="flex items-center text-sm text-[#0C2340] font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#2B4C7E] mr-2" />
                    Kepatuhan Regulasi
                  </li>
                </ul>
              </div>
              <div className="w-full md:w-1/3 aspect-square bg-linear-to-br from-[#2B4C7E]/10 to-white rounded-xl flex items-center justify-center border-2 border-[#2B4C7E]/20 overflow-hidden p-4">
                <Image
                  src="/industry-pharma.png"
                  alt="Pharmaceutical Safety"
                  width={300}
                  height={300}
                  className="w-full h-auto object-contain"
                />
              </div>
            </MotionDiv>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
