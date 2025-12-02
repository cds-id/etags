import { auth } from '@/lib/auth';
import { getDashboardStats } from '@/lib/actions/dashboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { ChatSection } from '@/components/ai-agent/chat-section';

export default async function ManageDashboard() {
  const session = await auth();
  const stats = await getDashboardStats();
  const isAdmin = session?.user.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dasbor</h2>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session?.user.name}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent gap-0 py-0">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Brand
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600 dark:text-blue-400"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.brands}
            </div>
            <CardDescription className="text-xs mt-1">
              {isAdmin ? (
                <Link
                  href="/manage/brands"
                  className="hover:underline text-blue-600/80 dark:text-blue-400/80"
                >
                  Kelola brand →
                </Link>
              ) : (
                'Brand aktif'
              )}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent gap-0 py-0">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Produk
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-600 dark:text-emerald-400"
              >
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.products}
            </div>
            <CardDescription className="text-xs mt-1">
              Produk dalam katalog
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent gap-0 py-0">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tag
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-600 dark:text-amber-400"
              >
                <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats.tags}
            </div>
            <CardDescription className="text-xs mt-1">
              Tag yang dibuat
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent gap-0 py-0">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tag Tercap
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-violet-600 dark:text-violet-400"
              >
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
              </svg>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {stats.stampedTags}
            </div>
            <CardDescription className="text-xs mt-1">
              Di blockchain
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant - Full Width Highlighted Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-2xl blur-xl" />
        <ChatSection
          role={isAdmin ? 'admin' : 'brand'}
          className="relative border-2 border-violet-500/30 shadow-lg shadow-purple-500/10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Aksi Cepat Card */}
        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-sky-500/10 via-sky-500/5 to-transparent gap-0 py-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-sky-600 dark:text-sky-400"
                >
                  <path d="m13 2-2 2.5h3L12 7" />
                  <path d="M10 14v-3" />
                  <path d="M14 14v-3" />
                  <path d="M11 19c-1.7 0-3-1.3-3-3v-2h8v2c0 1.7-1.3 3-3 3Z" />
                  <path d="M12 22v-3" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg text-sky-700 dark:text-sky-300">
                  Aksi Cepat
                </CardTitle>
                <CardDescription className="text-xs">
                  {isAdmin ? 'Tugas administratif umum' : 'Kelola brand Anda'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 grid gap-2">
            {isAdmin && (
              <>
                <Link
                  href="/manage/users"
                  className="flex items-center gap-3 rounded-xl border border-sky-200/50 dark:border-sky-800/50 bg-background/50 p-3 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
                >
                  <div className="h-9 w-9 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-rose-600 dark:text-rose-400"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Kelola Pengguna</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Tambah, edit, atau hapus akun
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
                <Link
                  href="/manage/brands"
                  className="flex items-center gap-3 rounded-xl border border-sky-200/50 dark:border-sky-800/50 bg-background/50 p-3 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Kelola Brand</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Konfigurasi pengaturan brand
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </>
            )}
            <Link
              href="/manage/products"
              className="flex items-center gap-3 rounded-xl border border-sky-200/50 dark:border-sky-800/50 bg-background/50 p-3 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Kelola Produk</p>
                <p className="text-xs text-muted-foreground truncate">
                  Tambah atau edit produk
                </p>
              </div>
              <svg
                className="h-4 w-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <Link
              href="/manage/tags"
              className="flex items-center gap-3 rounded-xl border border-sky-200/50 dark:border-sky-800/50 bg-background/50 p-3 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600 dark:text-amber-400"
                >
                  <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                  <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Kelola Tag</p>
                <p className="text-xs text-muted-foreground truncate">
                  Buat dan cap tag ke blockchain
                </p>
              </div>
              <svg
                className="h-4 w-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </CardContent>
        </Card>

        {/* Info Akun Card */}
        <Card className="relative overflow-hidden border-0 bg-linear-to-br from-teal-500/10 via-teal-500/5 to-transparent gap-0 py-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teal-600 dark:text-teal-400"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg text-teal-700 dark:text-teal-300">
                  Info Akun
                </CardTitle>
                <CardDescription className="text-xs">
                  Status akun Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-teal-200/50 dark:border-teal-800/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-600 dark:text-indigo-400"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">Peran</span>
              </div>
              <span className="font-semibold text-sm capitalize px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {session?.user.role}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-teal-200/50 dark:border-teal-800/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-pink-600 dark:text-pink-400"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">Email</span>
              </div>
              <span className="font-medium text-sm truncate max-w-[180px]">
                {session?.user.email}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-teal-200/50 dark:border-teal-800/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-600 dark:text-violet-400"
                  >
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">
                  Blockchain
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                    style={{
                      width: `${stats.tags > 0 ? (stats.stampedTags / stats.tags) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-sm text-violet-600 dark:text-violet-400">
                  {stats.tags > 0
                    ? `${((stats.stampedTags / stats.tags) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
