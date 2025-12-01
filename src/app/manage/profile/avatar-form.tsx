'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  uploadAvatar,
  removeAvatar,
  type ProfileFormState,
} from '@/lib/actions/profile';

type AvatarFormProps = {
  user: {
    name: string;
    avatar_url: string | null;
  };
};

export function AvatarForm({ user }: AvatarFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(user.avatar_url);
  const [isPendingRemove, startTransition] = useTransition();

  const [state, formAction, isPending] = useActionState<
    ProfileFormState,
    FormData
  >(uploadAvatar, {});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeAvatar();
      setPreview(null);
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>Unggah foto profil</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Unggah avatar baru</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Format yang diterima: JPEG, PNG, WebP, GIF (maks 5MB)
                </p>
              </div>
              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              {state.success && (
                <p className="text-sm text-green-600">{state.message}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Mengunggah...' : 'Unggah'}
                </Button>
                {(user.avatar_url || preview) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemove}
                    disabled={isPendingRemove}
                  >
                    {isPendingRemove ? 'Menghapus...' : 'Hapus'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
