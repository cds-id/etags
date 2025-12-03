import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'), // TODO: Update with production URL
  title: 'Etags - Product Tagging & Blockchain Stamping',
  description:
    'Platform penandaan produk & stamping blockchain untuk autentikasi dan verifikasi keaslian produk.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Etags',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Etags',
    title: 'Etags - Product Tagging & Blockchain Stamping',
    description:
      'Platform penandaan produk & stamping blockchain untuk autentikasi dan verifikasi keaslian produk.',
    images: [
      {
        url: '/logo.png',
        width: 500,
        height: 500,
        alt: 'Etags Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Etags - Product Tagging & Blockchain Stamping',
    description:
      'Platform penandaan produk & stamping blockchain untuk autentikasi dan verifikasi keaslian produk.',
    images: ['/logo.png'],
  },
};

export const viewport = {
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

import { SessionProvider } from '@/components/providers/session-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
