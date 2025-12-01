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

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updatePassword, {});

  useEffect(() => {
    if (state.success) {
      // Defer to avoid cascading renders
      requestAnimationFrame(() => {
        formRef.current?.reset();
      });
    }
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Kata Sandi</CardTitle>
        <CardDescription>
          Perbarui kata sandi Anda untuk menjaga keamanan akun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Masukkan kata sandi saat ini"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Kata Sandi Baru</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Masukkan kata sandi baru"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Konfirmasi kata sandi baru"
              required
              minLength={6}
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">{state.message}</p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
