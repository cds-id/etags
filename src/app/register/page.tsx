'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { register, type RegisterState } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  QrCode,
  BarChart3,
} from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(register, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0C2340] via-[#1E3A5F] to-[#2B4C7E] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-12 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Image
                src="/logo.png"
                alt="Etags Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">Etags</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Mulai Lindungi
            <br />
            Produk Anda Hari Ini
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Bergabung dengan ratusan brand yang telah mempercayai Etags untuk
            melindungi keaslian produk mereka.
          </p>

          {/* Features */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">
                  Perlindungan Blockchain
                </div>
                <div className="text-white/60 text-sm">
                  Setiap tag tercatat di blockchain
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">QR Code Unik</div>
                <div className="text-white/60 text-sm">
                  Tag anti-duplikasi untuk setiap produk
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">
                  Analitik Real-time
                </div>
                <div className="text-white/60 text-sm">
                  Pantau pemindaian dan deteksi kecurangan
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          &copy; {new Date().getFullYear()} Etags. All rights reserved.
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
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
          <p className="text-[#808080] text-sm mt-2">
            Lindungi produk Anda dengan teknologi blockchain
          </p>
        </div>

        <Card className="w-full max-w-md border-[#A8A8A8]/20 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-[#0C2340]">
              Daftar Akun Baru
            </CardTitle>
            <CardDescription className="text-[#808080]">
              Buat akun untuk mulai melindungi produk brand Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              {state.error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-500 text-xs">!</span>
                  </div>
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#0C2340]">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A8A8]" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nama Anda"
                    required
                    autoComplete="name"
                    disabled={isPending}
                    className="pl-10 border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#0C2340]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A8A8]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    required
                    autoComplete="email"
                    disabled={isPending}
                    className="pl-10 border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#0C2340]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A8A8]" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    required
                    autoComplete="new-password"
                    disabled={isPending}
                    className="pl-10 pr-10 border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#A8A8A8] hover:text-[#808080] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#0C2340]">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A8A8]" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    required
                    autoComplete="new-password"
                    disabled={isPending}
                    className="pl-10 pr-10 border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#A8A8A8] hover:text-[#808080] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full shadow-lg shadow-[#2B4C7E]/30 h-11"
                disabled={isPending}
              >
                {isPending ? (
                  'Mendaftar...'
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-[#808080] text-center text-sm">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-[#2B4C7E] hover:text-[#1E3A5F] font-medium hover:underline"
              >
                Masuk di sini
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Mobile features */}
        <div className="lg:hidden mt-8 grid grid-cols-3 gap-3 w-full max-w-md">
          <div className="text-center p-3 rounded-xl bg-white border border-[#A8A8A8]/20 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-5 h-5 text-[#2B4C7E]" />
            </div>
            <p className="text-[#808080] text-xs">Blockchain</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white border border-[#A8A8A8]/20 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-2">
              <QrCode className="w-5 h-5 text-[#2B4C7E]" />
            </div>
            <p className="text-[#808080] text-xs">QR Code</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white border border-[#A8A8A8]/20 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-[#2B4C7E]" />
            </div>
            <p className="text-[#808080] text-xs">Analitik</p>
          </div>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className="mt-6 text-sm text-[#808080] hover:text-[#2B4C7E] transition-colors"
        >
          &larr; Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
