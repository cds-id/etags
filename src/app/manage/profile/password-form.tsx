'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { updatePassword, type ProfileFormState } from '@/lib/actions/profile';
import { Lock } from 'lucide-react';

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updatePassword, {});

  useEffect(() => {
    if (state.success) {
      requestAnimationFrame(() => {
        formRef.current?.reset();
      });
    }
  }, [state.success]);

  return (
    <Card className="relative overflow-hidden border-0 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-amber-700 dark:text-amber-300">
              Ubah Kata Sandi
            </CardTitle>
            <CardDescription className="text-xs">
              Perbarui kata sandi Anda untuk menjaga keamanan akun
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Kata Sandi Saat Ini
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Masukkan kata sandi saat ini"
              required
              className="bg-background/50 border-amber-200/50 dark:border-amber-800/50 focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              Kata Sandi Baru
            </Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Masukkan kata sandi baru"
              required
              minLength={6}
              className="bg-background/50 border-amber-200/50 dark:border-amber-800/50 focus:border-amber-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Konfirmasi Kata Sandi Baru
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Konfirmasi kata sandi baru"
              required
              minLength={6}
              className="bg-background/50 border-amber-200/50 dark:border-amber-800/50 focus:border-amber-500"
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {state.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
          >
            {isPending ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
