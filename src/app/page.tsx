import Link from 'next/link';
import {
  Shield,
  QrCode,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Scan,
  Globe,
  Lock,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Etags
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/explorer">
                <Globe className="mr-2 h-4 w-4" />
                Explorer
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href="/scan">
                <Scan className="mr-2 h-4 w-4" />
                Scan
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Masuk
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 sm:mb-6" variant="secondary">
            <Sparkles className="mr-1 h-3 w-3" />
            Teknologi Blockchain untuk Keaslian Produk
          </Badge>
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900">
            Lindungi Produk Anda dari{' '}
            <span className="text-blue-600">Pemalsuan</span>
          </h1>
          <p className="mx-auto mb-6 sm:mb-8 max-w-2xl text-base sm:text-lg lg:text-xl text-gray-600">
            Etags adalah sistem verifikasi produk berbasis blockchain yang
            membantu brand melindungi produk mereka dan konsumen memverifikasi
            keaslian barang yang dibeli.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/scan">
                <QrCode className="mr-2 h-5 w-5" />
                Scan Produk
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="/explorer">
                <Search className="mr-2 h-5 w-5" />
                Jelajahi Blockchain
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-red-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 sm:mb-12 text-center">
              <Badge variant="destructive" className="mb-3 sm:mb-4">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Masalah yang Dihadapi
              </Badge>
              <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Pemalsuan Produk Merugikan Semua Pihak
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Industri pemalsuan global bernilai triliunan rupiah setiap tahun
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-red-200 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    Kerugian Finansial
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Brand kehilangan pendapatan dan reputasi akibat produk palsu
                    yang beredar di pasaran dengan harga lebih murah.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    Risiko Kesehatan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Produk palsu tidak melewati standar kualitas dan dapat
                    membahayakan kesehatan konsumen.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    Sulit Dideteksi
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Produk palsu semakin sulit dibedakan dari aslinya, membuat
                    konsumen kebingungan saat membeli.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 sm:mb-12 text-center">
              <Badge className="mb-3 sm:mb-4 bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Solusi Kami
              </Badge>
              <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Verifikasi Keaslian dengan Teknologi Blockchain
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Etags menggunakan teknologi blockchain untuk memastikan setiap
                produk dapat diverifikasi keasliannya
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100">
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    Tag QR Unik
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Setiap produk dilengkapi dengan tag QR unik yang terdaftar
                    di blockchain dan tidak dapat dipalsukan.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100">
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    Data Tidak Dapat Diubah
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Informasi produk tersimpan permanen di blockchain,
                    memastikan data tidak dapat dimanipulasi.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-100">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    Deteksi AI
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Sistem AI kami menganalisis pola pemindaian untuk mendeteksi
                    aktivitas mencurigakan dan produk palsu.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 sm:mb-12 text-center">
              <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Cara Kerja
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Verifikasi produk hanya dalam 3 langkah mudah
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 text-xl sm:text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                  Scan QR Code
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Buka kamera atau aplikasi scanner dan arahkan ke tag QR pada
                  produk
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 text-xl sm:text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                  Verifikasi Otomatis
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Sistem akan memverifikasi keaslian tag melalui blockchain
                  secara instan
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 text-xl sm:text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                  Lihat Hasil
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Dapatkan informasi lengkap tentang produk dan status
                  keasliannya
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 sm:mb-12 text-center">
              <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Mulai Sekarang
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Pilih aksi yang ingin Anda lakukan
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/scan" className="group">
                <Card className="h-full transition-all hover:border-blue-300 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200">
                      <Scan className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-900">
                      Scan Produk
                    </h3>
                    <p className="mb-4 text-xs sm:text-sm text-gray-600">
                      Verifikasi keaslian produk dengan memindai tag QR
                    </p>
                    <span className="flex items-center text-sm font-medium text-blue-600">
                      Mulai Scan
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/explorer" className="group">
                <Card className="h-full transition-all hover:border-purple-300 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-purple-100 transition-colors group-hover:bg-purple-200">
                      <Globe className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                    <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-900">
                      Explorer
                    </h3>
                    <p className="mb-4 text-xs sm:text-sm text-gray-600">
                      Jelajahi transaksi dan data tag di blockchain
                    </p>
                    <span className="flex items-center text-sm font-medium text-purple-600">
                      Buka Explorer
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/login" className="group sm:col-span-2 lg:col-span-1">
                <Card className="h-full transition-all hover:border-green-300 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 sm:p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-200">
                      <LogIn className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                    <h3 className="mb-2 text-lg sm:text-xl font-semibold text-gray-900">
                      Login Brand
                    </h3>
                    <p className="mb-4 text-xs sm:text-sm text-gray-600">
                      Masuk untuk mengelola produk dan tag Anda
                    </p>
                    <span className="flex items-center text-sm font-medium text-green-600">
                      Masuk Sekarang
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Siap Melindungi Produk Anda?
            </h2>
            <p className="mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg text-blue-100">
              Bergabung dengan ratusan brand yang telah menggunakan Etags untuk
              melindungi produk mereka dari pemalsuan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Masuk / Daftar
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-white text-black hover:bg-white hover:text-blue-600"
              >
                <Link href="/scan">
                  <QrCode className="mr-2 h-5 w-5" />
                  Coba Scan Sekarang
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span className="text-base sm:text-lg font-bold text-gray-900">
                Etags
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Etags. Powered by Base Sepolia
              Blockchain.
            </p>
            <div className="flex gap-4 sm:gap-6">
              <Link
                href="/scan"
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-900"
              >
                Scan
              </Link>
              <Link
                href="/explorer"
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-900"
              >
                Explorer
              </Link>
              <Link
                href="/docs"
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-900"
              >
                API Docs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
