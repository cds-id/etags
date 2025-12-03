'use client';

import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export function FAQ() {
  return (
    <section className="relative z-10 py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <MotionDiv
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-[#0C2340] mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
        </MotionDiv>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            {
              q: 'Apakah saya perlu crypto untuk menggunakan Etags?',
              a: 'Tidak. Kami mengabstraksikan semua kompleksitas blockchain. Anda membayar dalam fiat, kami menangani biaya gas dan manajemen wallet.',
            },
            {
              q: 'Bisakah QR code disalin?',
              a: 'Meskipun penyalinan fisik dimungkinkan, sistem kami mendeteksi scan duplikat dan anomali lokasi/waktu, menandai potensi pemalsuan segera.',
            },
            {
              q: 'Berapa lama proses integrasi?',
              a: 'Anda dapat mulai menandai produk secara manual dalam hitungan menit. Integrasi API untuk lini manufaktur otomatis biasanya memakan waktu 1-2 minggu.',
            },
            {
              q: 'Apakah data saya publik?',
              a: 'Hanya hash verifikasi yang publik. Intelijen bisnis sensitif dan data rantai pasokan Anda tetap pribadi dan terenkripsi.',
            },
          ].map((item, i) => (
            <MotionDiv
              key={i}
              className="bg-white p-6 rounded-xl border-2 border-[#A8A8A8]/20 shadow-lg hover:shadow-xl hover:shadow-[#2B4C7E]/10 hover:border-[#2B4C7E]/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="font-bold text-[#0C2340] mb-3 text-lg">
                {item.q}
              </h3>
              <p className="text-[#808080] text-sm leading-relaxed">{item.a}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
