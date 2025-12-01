'use client';

import Image from 'next/image';

type RemoteImageProps = {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: React.ReactNode;
};

/**
 * Remote image component that handles both data URLs and remote URLs
 * - Data URLs (base64): Uses native img tag
 * - Remote URLs: Uses Next.js Image for optimization
 */
export function RemoteImage({
  src,
  alt,
  width,
  height,
  className,
  fallback,
}: RemoteImageProps) {
  if (!src) {
    return fallback ? <>{fallback}</> : null;
  }

  // Data URLs should use native img
  if (src.startsWith('data:')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  // Remote URLs use Next.js Image
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={!src.includes('etags.cylink.site')}
    />
  );
}
