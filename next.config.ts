import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'etags.cylink.site',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        // Cloudflare R2 public domain for NFT images
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        // Alternative R2 custom domain pattern
        protocol: 'https',
        hostname: '*.cloudflarestorage.com',
      },
    ],
  },
};

export default nextConfig;
