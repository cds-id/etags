'use client';

import { useActionState } from 'react';
import Link from 'next/link';
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
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    {}
  );

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
          <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses dashboard
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@perusahaan.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-muted-foreground text-center text-sm">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Daftar sekarang
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
