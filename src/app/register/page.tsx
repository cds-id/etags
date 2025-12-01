'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
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
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<
    RegisterState,
    FormData
  >(register, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="mb-4 inline-flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold">Etags</span>
        </Link>
        <p className="text-muted-foreground">
          Lindungi produk Anda dengan teknologi blockchain
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Daftar Akun Baru</CardTitle>
          <CardDescription>
            Buat akun untuk mulai melindungi produk brand Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nama Anda"
                required
                autoComplete="name"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@perusahaan.com"
                required
                autoComplete="email"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  required
                  autoComplete="new-password"
                  disabled={isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  required
                  autoComplete="new-password"
                  disabled={isPending}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-muted-foreground text-center text-sm">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Features */}
      <div className="mt-8 grid max-w-2xl grid-cols-1 gap-4 text-center sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 text-2xl">1</div>
          <p className="text-muted-foreground text-sm">Daftar akun gratis</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 text-2xl">2</div>
          <p className="text-muted-foreground text-sm">Setup brand & produk</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-2 text-2xl">3</div>
          <p className="text-muted-foreground text-sm">Buat tag anti-palsu</p>
        </div>
      </div>
    </div>
  );
}
