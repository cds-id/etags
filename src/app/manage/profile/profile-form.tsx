'use client';

import { useActionState, useRef } from 'react';
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
import { updateProfile, type ProfileFormState } from '@/lib/actions/profile';
import { User } from 'lucide-react';

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(updateProfile, {});

  return (
    <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
              Informasi Profil
            </CardTitle>
            <CardDescription className="text-xs">
              Perbarui detail akun Anda
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nama
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              placeholder="Masukkan nama Anda"
              required
              className="bg-background/50 border-blue-200/50 dark:border-blue-800/50 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              placeholder="Masukkan email Anda"
              required
              className="bg-background/50 border-blue-200/50 dark:border-blue-800/50 focus:border-blue-500"
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
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
