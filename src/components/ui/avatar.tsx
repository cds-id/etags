'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import Image from 'next/image';

import { cn } from '@/lib/utils';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  );
}

type AvatarImageProps = Omit<
  React.ComponentProps<typeof AvatarPrimitive.Image>,
  'src'
> & {
  src?: string | null;
};

function AvatarImage({ className, src, ...props }: AvatarImageProps) {
  // Skip rendering if no src
  if (!src) {
    return null;
  }

  // For data URLs or non-etags URLs, use the default Radix image
  if (src.startsWith('data:') || !src.includes('etags.cylink.site')) {
    return (
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className={cn('aspect-square size-full object-cover', className)}
        src={src}
        {...props}
      />
    );
  }

  // For etags.cylink.site URLs, use Next.js Image
  return (
    <Image
      data-slot="avatar-image"
      src={src}
      alt={props.alt || 'Avatar'}
      fill
      className={cn('aspect-square size-full object-cover', className)}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
