'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  QrCode,
  Link2,
  Truck,
  Scan,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function BlockchainVisualization() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    {
      id: 0,
      title: 'Pembuatan Tag',
      description: 'Tag QR Code dibuat dengan ID unik untuk setiap produk',
      icon: QrCode,
      color: '#2B4C7E',
      detail: 'Setiap tag memiliki kode unik yang tidak dapat diduplikasi',
    },
    {
      id: 1,
      title: 'Stamping Blockchain',
      description: 'Data tag dicatat ke blockchain Base Sepolia',
      icon: Link2,
      color: '#1E3A5F',
      detail: 'Hash: 0x7a8f...3d2e | Block: #12,345,678',
    },
    {
      id: 2,
      title: 'Distribusi Produk',
      description: 'Tag dipasang pada produk dan didistribusikan',
      icon: Truck,
      color: '#0C2340',
      detail: 'Tracking real-time lokasi dan status distribusi',
    },
    {
      id: 3,
      title: 'Scan Konsumen',
      description: 'Konsumen melakukan scan QR code via browser',
      icon: Scan,
      color: '#2B4C7E',
      detail: 'Tanpa aplikasi, langsung verifikasi keaslian',
    },
    {
      id: 4,
      title: 'Verifikasi Sukses',
      description: 'Sistem memverifikasi keaslian produk dari blockchain',
      icon: ShieldCheck,
      color: '#1E3A5F',
      detail: 'Status: ✓ Produk Asli & Terjamin',
    },
  ];

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating, steps.length]);

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-[#0C2340] mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bagaimana Etags Bekerja
        </motion.h2>
        <motion.p
          className="text-lg text-[#808080] max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Proses end-to-end dari pembuatan tag hingga verifikasi keaslian produk
        </motion.p>
      </div>

      {/* Blockchain Flow Visualization */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#2B4C7E]/20 via-[#1E3A5F]/20 to-[#0C2340]/20 transform -translate-y-1/2 hidden lg:block" />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isPassed = index < activeStep;

            return (
              <motion.div
                key={step.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => {
                  setIsAnimating(false);
                  setActiveStep(index);
                }}
                onHoverEnd={() => setIsAnimating(true)}
              >
                {/* Card */}
                <motion.div
                  className={`relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'border-[#2B4C7E] shadow-2xl shadow-[#2B4C7E]/30 scale-105'
                      : isPassed
                        ? 'border-[#2B4C7E]/30 shadow-lg'
                        : 'border-[#A8A8A8]/20 shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3">
                    <motion.div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive || isPassed
                          ? 'bg-[#2B4C7E] text-white'
                          : 'bg-[#A8A8A8]/30 text-[#808080]'
                      }`}
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </motion.div>
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                      isActive
                        ? 'bg-gradient-to-br from-[#2B4C7E] to-[#1E3A5F]'
                        : 'bg-gradient-to-br from-[#2B4C7E]/10 to-[#1E3A5F]/5'
                    }`}
                    animate={
                      isActive
                        ? {
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon
                      className={`w-8 h-8 ${
                        isActive ? 'text-white' : 'text-[#2B4C7E]'
                      }`}
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-base font-bold text-[#0C2340] mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#808080] text-center leading-relaxed mb-3">
                    {step.description}
                  </p>

                  {/* Detail Badge (shown when active) */}
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? 'auto' : 0,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-2 bg-[#2B4C7E]/5 rounded-lg">
                      <p className="text-xs text-[#0C2340] font-mono text-center">
                        {step.detail}
                      </p>
                    </div>
                  </motion.div>

                  {/* Animated Border Glow */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: `linear-gradient(${step.color}, transparent)`,
                        opacity: 0.1,
                      }}
                      animate={{
                        opacity: [0.1, 0.3, 0.1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <motion.div
                      className="w-6 h-6 text-[#2B4C7E]"
                      animate={{
                        x: [0, 5, 0],
                        opacity: isPassed ? 1 : 0.3,
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#0C2340]">
            Proses: {steps[activeStep].title}
          </span>
          <span className="text-sm text-[#808080]">
            {activeStep + 1} / {steps.length}
          </span>
        </div>
        <div className="w-full h-2 bg-[#A8A8A8]/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2B4C7E] to-[#1E3A5F]"
            initial={{ width: '0%' }}
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => {
            setIsAnimating(false);
            setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
          }}
          className="px-4 py-2 rounded-full bg-[#A8A8A8]/20 text-[#0C2340] hover:bg-[#2B4C7E]/10 transition-colors font-medium text-sm"
        >
          ← Sebelumnya
        </button>
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
            isAnimating
              ? 'bg-[#2B4C7E] text-white hover:bg-[#1E3A5F]'
              : 'bg-[#A8A8A8]/20 text-[#0C2340] hover:bg-[#2B4C7E]/10'
          }`}
        >
          {isAnimating ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => {
            setIsAnimating(false);
            setActiveStep((prev) => (prev + 1) % steps.length);
          }}
          className="px-4 py-2 rounded-full bg-[#A8A8A8]/20 text-[#0C2340] hover:bg-[#2B4C7E]/10 transition-colors font-medium text-sm"
        >
          Selanjutnya →
        </button>
      </div>
    </div>
  );
}
