'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { RocketJourney } from '@/components/landing/RocketJourney';
import { Features } from '@/components/landing/Features';
import { Industries } from '@/components/landing/Industries';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

const MotionDiv = motion.div;

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white font-sans selection:bg-[#2B4C7E]/20 selection:text-[#0C2340] overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <MotionDiv
          className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-[#2B4C7E]/20 blur-[120px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <MotionDiv
          className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#A8A8A8]/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <Navbar />
      <Hero />

      {/* Rocket Journey Section */}
      <section className="relative z-10 bg-gradient-to-b from-white via-[#2B4C7E]/5 to-[#0C2340]/10">
        <RocketJourney />
      </section>

      <Features />
      <Industries />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
