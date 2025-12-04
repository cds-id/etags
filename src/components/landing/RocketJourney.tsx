'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CheckCircle2,
  QrCode,
  Link2,
  Truck,
  Scan,
  ShieldCheck,
  Gem,
  HeadphonesIcon,
  Rocket,
  Moon,
  Star,
  Sparkles,
} from 'lucide-react';

// Pre-generate star positions to avoid Math.random during render
const STAR_POSITIONS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: (i * 17 + 13) % 100, // Deterministic pseudo-random distribution
  top: (i * 23 + 7) % 100,
  size: 4 + ((i * 7) % 10),
}));

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    id: 0,
    title: 'Pembuatan Tag',
    description: 'Tag QR Code dibuat dengan ID unik untuk setiap produk',
    icon: QrCode,
    detail: 'Setiap tag memiliki kode unik yang tidak dapat diduplikasi',
  },
  {
    id: 1,
    title: 'Stamping Blockchain',
    description: 'Data tag dicatat ke blockchain Base Sepolia',
    icon: Link2,
    detail: 'Hash: 0x7a8f...3d2e | Block: #12,345,678',
  },
  {
    id: 2,
    title: 'Distribusi Produk',
    description: 'Tag dipasang pada produk dan didistribusikan',
    icon: Truck,
    detail: 'Tracking real-time lokasi dan status distribusi',
  },
  {
    id: 3,
    title: 'Scan Konsumen',
    description: 'Konsumen melakukan scan QR code via browser',
    icon: Scan,
    detail: 'Tanpa aplikasi, langsung verifikasi keaslian',
  },
  {
    id: 4,
    title: 'Verifikasi Sukses',
    description: 'Sistem memverifikasi keaslian produk dari blockchain',
    icon: ShieldCheck,
    detail: 'Status: ✓ Produk Asli & Terjamin',
  },
  {
    id: 5,
    title: 'Klaim NFT Collectible',
    description: 'Pemilik pertama mendapatkan NFT unik dari AI',
    icon: Gem,
    detail: 'Artwork eksklusif di-mint ke wallet Anda',
  },
  {
    id: 6,
    title: 'Web3 Support',
    description: 'Ajukan komplain langsung ke brand via wallet',
    icon: HeadphonesIcon,
    detail: 'Tiket otomatis diarahkan ke brand terkait',
  },
];

export function RocketJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const checkmarksRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // Rocket path animation
      if (rocketRef.current && containerRef.current) {
        // Create the rocket flight path
        gsap.set(rocketRef.current, {
          y: '100vh',
          x: '0%',
          rotation: -30,
          scale: 0.5,
          opacity: 0,
        });

        // Rocket entrance and flight
        const rocketTl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1.5,
            onUpdate: (self) => {
              // Calculate which step we're at based on progress
              const progress = self.progress;
              const stepIndex = Math.floor(progress * steps.length);
              if (stepIndex !== activeStep && stepIndex < steps.length) {
                setActiveStep(stepIndex);
              }
            },
          },
        });

        // Rocket animation along curved path
        rocketTl
          .to(rocketRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.1,
          })
          .to(
            rocketRef.current,
            {
              y: '-120vh',
              rotation: -15,
              duration: 1,
              ease: 'none',
            },
            0
          )
          .to(
            rocketRef.current,
            {
              x: '50vw',
              duration: 0.5,
              ease: 'power1.inOut',
              yoyo: true,
              repeat: 1,
            },
            0
          )
          .to(
            rocketRef.current,
            {
              scale: 0.6,
              duration: 0.3,
            },
            0.7
          );
      }

      // Progress line animation
      if (progressLineRef.current) {
        gsap.fromTo(
          progressLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: true,
            },
          }
        );
      }

      // Animate each step
      stepsRef.current.forEach((step, index) => {
        if (!step) return;

        // Step card animation
        gsap.fromTo(
          step,
          {
            opacity: 0,
            x: index % 2 === 0 ? -100 : 100,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 1,
            },
          }
        );

        // Checkmark animation
        const checkmark = checkmarksRef.current[index];
        if (checkmark) {
          gsap.fromTo(
            checkmark,
            { scale: 0, rotation: -180 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.5,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: step,
                start: 'top 60%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });

      // Moon animation
      if (moonRef.current) {
        gsap.fromTo(
          moonRef.current,
          {
            scale: 0.5,
            opacity: 0,
            y: 50,
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: moonRef.current,
              start: 'top 90%',
              end: 'top 50%',
              scrub: true,
            },
          }
        );

        // Moon glow pulse
        gsap.to(moonRef.current.querySelector('.moon-glow'), {
          scale: 1.3,
          opacity: 0.8,
          duration: 2,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
        });
      }

      // Floating stars animation
      gsap.utils.toArray<HTMLElement>('.floating-star').forEach((star, i) => {
        gsap.to(star, {
          y: -30 - Math.random() * 20,
          opacity: 0.3 + Math.random() * 0.7,
          duration: 2 + Math.random() * 2,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [activeStep]);

  return (
    <div ref={containerRef} className="relative min-h-[200vh] overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STAR_POSITIONS.map((star) => (
          <div
            key={star.id}
            className="floating-star absolute"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
          >
            <Star
              className="text-[#2B4C7E]/30"
              size={star.size}
              fill="currentColor"
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0C2340]/5 to-[#0C2340]/20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-20 text-center pt-20 pb-12 px-4">
        <div className="inline-flex items-center gap-2 bg-[#2B4C7E]/10 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-[#2B4C7E]" />
          <span className="text-sm font-medium text-[#2B4C7E]">
            Perjalanan Interaktif
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0C2340] mb-4">
          Bagaimana Etags Bekerja
        </h2>
        <p className="text-lg text-[#808080] max-w-2xl mx-auto">
          Scroll untuk mengikuti perjalanan roket dari pembuatan tag hingga
          verifikasi sukses
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index <= activeStep ? 'w-8 bg-[#2B4C7E]' : 'w-2 bg-[#A8A8A8]/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rocket */}
      <div
        ref={rocketRef}
        className="fixed left-4 md:left-8 z-30 pointer-events-none"
        style={{ top: '50%' }}
      >
        <div className="relative">
          {/* Rocket trail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 overflow-hidden">
            <div className="rocket-trail w-full">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-6 bg-gradient-to-b from-orange-500/80 via-yellow-400/60 to-transparent rounded-full mb-1 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    opacity: 1 - i * 0.1,
                    transform: `scale(${1 - i * 0.08})`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Rocket body */}
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <div className="absolute inset-0 rounded-full bg-[#2B4C7E]/40 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#2B4C7E] to-[#0C2340] flex items-center justify-center shadow-2xl shadow-[#2B4C7E]/50 border-4 border-white/30">
              <Rocket className="w-8 h-8 md:w-10 md:h-10 text-white transform -rotate-45" />
            </div>
          </div>

          {/* Particle effects */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-400 animate-ping"
                style={{
                  left: `${(i - 2) * 8}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Journey Path - Vertical Timeline */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B4C7E]/10 via-[#1E3A5F]/20 to-[#0C2340]/10 rounded-full" />
          <div
            ref={progressLineRef}
            className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-[#2B4C7E] via-[#1E3A5F] to-[#0C2340] rounded-full origin-top"
            style={{ transformOrigin: 'top' }}
          />
        </div>

        {/* Steps */}
        <div className="relative space-y-32 md:space-y-48">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLeft = index % 2 === 0;
            const isActive = index <= activeStep;

            return (
              <div
                key={step.id}
                ref={(el) => {
                  stepsRef.current[index] = el;
                }}
                className={`relative flex items-center ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                } flex-col md:gap-12`}
              >
                {/* Content Card */}
                <div
                  className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'} text-center md:text-inherit`}
                >
                  <div
                    className={`relative bg-white rounded-2xl p-6 md:p-8 border-2 shadow-xl transition-all duration-500 inline-block max-w-md ${
                      isActive
                        ? 'border-[#2B4C7E] shadow-[#2B4C7E]/20'
                        : 'border-[#A8A8A8]/20 shadow-[#A8A8A8]/10'
                    }`}
                  >
                    {/* Glow effect when active */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2B4C7E]/10 to-transparent rounded-2xl" />
                    )}

                    <div
                      className={`relative flex items-center gap-4 mb-4 ${
                        isLeft
                          ? 'md:justify-end md:flex-row-reverse'
                          : 'md:justify-start'
                      } justify-center`}
                    >
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                          isActive
                            ? 'bg-gradient-to-br from-[#2B4C7E] to-[#1E3A5F] shadow-[#2B4C7E]/40'
                            : 'bg-gradient-to-br from-[#A8A8A8]/30 to-[#A8A8A8]/10'
                        }`}
                      >
                        <Icon
                          className={`w-7 h-7 transition-colors duration-500 ${
                            isActive ? 'text-white' : 'text-[#808080]'
                          }`}
                        />
                      </div>
                      <div className={isLeft ? 'md:text-right' : ''}>
                        <span
                          className={`text-xs font-medium uppercase tracking-wider ${
                            isActive ? 'text-[#2B4C7E]' : 'text-[#A8A8A8]'
                          }`}
                        >
                          Langkah {index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-[#0C2340]">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="relative text-[#808080] mb-4">
                      {step.description}
                    </p>

                    <div
                      className={`relative p-3 rounded-xl transition-all duration-500 ${
                        isActive ? 'bg-[#2B4C7E]/10' : 'bg-[#A8A8A8]/5'
                      }`}
                    >
                      <p
                        className={`text-sm font-mono ${
                          isActive ? 'text-[#0C2340]' : 'text-[#808080]'
                        }`}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Checkpoint */}
                <div className="relative z-20 order-first md:order-none my-6 md:my-0">
                  <div
                    className={`w-20 h-20 rounded-full bg-white border-4 flex items-center justify-center shadow-xl transition-all duration-500 ${
                      isActive
                        ? 'border-[#2B4C7E] shadow-[#2B4C7E]/30'
                        : 'border-[#A8A8A8]/30'
                    }`}
                  >
                    <div
                      ref={(el) => {
                        checkmarksRef.current[index] = el;
                      }}
                      className={`transition-all duration-500 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#A8A8A8]/30" />
                      </div>
                    )}
                  </div>

                  {/* Step number */}
                  <div
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-500 ${
                      isActive
                        ? 'bg-[#2B4C7E] text-white'
                        : 'bg-[#A8A8A8]/30 text-[#808080]'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Moon Destination */}
      <div ref={moonRef} className="relative z-10 py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-8">
            {/* Moon glow */}
            <div className="moon-glow absolute inset-0 bg-[#2B4C7E]/20 rounded-full blur-3xl scale-150" />

            {/* Moon */}
            <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-[#F0F0F0] via-[#E0E0E0] to-[#C0C0C0] flex items-center justify-center shadow-2xl shadow-[#A8A8A8]/50 mx-auto border-4 border-white/60">
              <Moon className="w-20 h-20 md:w-24 md:h-24 text-[#808080]" />

              {/* Moon craters */}
              <div className="absolute top-6 right-8 w-6 h-6 rounded-full bg-[#B0B0B0]/40" />
              <div className="absolute bottom-10 left-6 w-4 h-4 rounded-full bg-[#B0B0B0]/40" />
              <div className="absolute top-16 left-10 w-3 h-3 rounded-full bg-[#B0B0B0]/40" />
              <div className="absolute bottom-16 right-12 w-5 h-5 rounded-full bg-[#B0B0B0]/40" />

              {/* Success badge */}
              {activeStep >= steps.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Terverifikasi!
                </div>
              )}
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold text-[#0C2340] mb-3">
            Misi Selesai! 🎉
          </h3>
          <p className="text-[#808080] text-lg">
            Produk Anda telah terverifikasi dengan aman di blockchain
          </p>

          {/* Final stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-sm mx-auto">
            <div className="bg-white rounded-xl p-4 border border-[#2B4C7E]/20 shadow-lg">
              <div className="text-2xl font-bold text-[#2B4C7E]">100%</div>
              <div className="text-xs text-[#808080]">Aman</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#2B4C7E]/20 shadow-lg">
              <div className="text-2xl font-bold text-[#2B4C7E]">7</div>
              <div className="text-xs text-[#808080]">Langkah</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#2B4C7E]/20 shadow-lg">
              <div className="text-2xl font-bold text-[#2B4C7E]">∞</div>
              <div className="text-xs text-[#808080]">Permanen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint (shows only at start) */}
      {activeStep < 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="flex flex-col items-center text-[#808080] text-sm bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <span>Scroll ke bawah</span>
            <svg
              className="w-5 h-5 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
