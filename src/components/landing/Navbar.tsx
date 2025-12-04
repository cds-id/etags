'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/explorer', label: 'Explorer' },
    { href: '/scan', label: 'Scanner' },
    { href: '/faqs', label: 'FAQ' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-[#A8A8A8]/20 py-4 shadow-sm'
            : 'bg-transparent py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Image
                src="/logo.png"
                alt="Etags Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0C2340]">
              Etags
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-medium text-[#1E3A5F]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative hover:text-[#2B4C7E] transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2B4C7E] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                asChild
                className="text-[#1E3A5F] hover:text-[#0C2340] hover:bg-[#A8A8A8]/10 font-medium"
              >
                <Link href="/login">Masuk</Link>
              </Button>
              <Button
                asChild
                className="bg-[#2B4C7E] text-white hover:bg-[#1E3A5F] shadow-lg shadow-[#2B4C7E]/30 rounded-full px-6"
              >
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#0C2340] hover:bg-[#A8A8A8]/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white z-50 md:hidden shadow-2xl border-l border-[#A8A8A8]/20 p-6 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8">
                    <Image
                      src="/logo.png"
                      alt="Etags Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-lg font-bold text-[#0C2340]">
                    Etags
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[#808080] hover:text-[#0C2340] hover:bg-[#A8A8A8]/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-[#1E3A5F] hover:text-[#2B4C7E] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-auto pt-8 border-t border-[#A8A8A8]/20">
                <Button
                  variant="outline"
                  asChild
                  className="w-full border-[#2B4C7E]/20 text-[#0C2340] hover:bg-[#2B4C7E]/5"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-[#2B4C7E] text-white hover:bg-[#1E3A5F] shadow-lg shadow-[#2B4C7E]/20"
                >
                  <Link href="/register">Mulai Sekarang</Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
