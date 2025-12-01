'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createUser,
  updateUser,
  type UserFormState,
} from '@/lib/actions/users';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: number;
  avatar_url: string | null;
};

type UserFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
};

export function UserForm({ open, onOpenChange, user }: UserFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!user;

  const boundUpdateUser = user ? updateUser.bind(null, user.id) : createUser;

  const [state, formAction, isPending] = useActionState<
    UserFormState,
    FormData
  >(boundUpdateUser, {});

  useEffect(() => {
    if (state.success) {
      // Defer state update to avoid cascading renders
      requestAnimationFrame(() => {
        onOpenChange(false);
        formRef.current?.reset();
      });
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Pengguna' : 'Buat Pengguna'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui detail pengguna. Kosongkan kata sandi untuk mempertahankan yang saat ini.'
              : 'Buat akun pengguna baru.'}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user?.name || ''}
              placeholder="Masukkan nama"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user?.email || ''}
              placeholder="Masukkan email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Kata Sandi{' '}
              {isEdit && '(kosongkan untuk mempertahankan yang saat ini)'}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={isEdit ? '••••••••' : 'Masukkan kata sandi'}
              required={!isEdit}
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Peran</Label>
            <Select name="role" defaultValue={user?.role || 'brand'}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={String(user?.status ?? 1)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Aktif</SelectItem>
                <SelectItem value="0">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
