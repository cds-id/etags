'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { login, type LoginState } from '@/lib/actions/auth';
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
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

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

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Lindungi Produk Anda
            <br />
            dengan Teknologi Blockchain
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Platform anti-pemalsuan terdepan yang menggunakan blockchain untuk
            memastikan keaslian setiap produk Anda.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-white/60 text-sm">Tag Aktif</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/60 text-sm">Brand Terdaftar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          &copy; {new Date().getFullYear()} Etags. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-white via-[#2B4C7E]/5 to-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
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
              Selamat Datang
            </CardTitle>
            <CardDescription className="text-[#808080]">
              Masukkan kredensial Anda untuk mengakses dashboard
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
                    type="password"
                    required
                    autoComplete="current-password"
                    className="pl-10 border-[#A8A8A8]/30 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]/20"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#2B4C7E] hover:bg-[#1E3A5F] text-white rounded-full shadow-lg shadow-[#2B4C7E]/30 h-11"
                disabled={isPending}
              >
                {isPending ? (
                  'Masuk...'
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="text-[#808080] text-center text-sm">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="text-[#2B4C7E] hover:text-[#1E3A5F] font-medium hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Back to home */}
        <Link
          href="/"
          className="mt-8 text-sm text-[#808080] hover:text-[#2B4C7E] transition-colors"
        >
          &larr; Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
