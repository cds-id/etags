import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from './sidebar';
import Link from 'next/link';
import { Suspense } from 'react';
import { UserProfileHeader } from './user-profile-header';
import { Skeleton } from '@/components/ui/skeleton';
import { prisma } from '@/lib/db';

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Check onboarding status from database for brand users
  // This ensures we always have fresh data, not stale JWT claims
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isOnOnboarding = pathname.startsWith('/manage/onboarding');

  if (session.user.role === 'brand' && !isOnOnboarding) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { onboarding_complete: true },
    });

    if (user && user.onboarding_complete !== 1) {
      redirect('/manage/onboarding');
    }
  }

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 via-blue-50/30 to-violet-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-violet-950/20">
      <header className="sticky top-0 z-50 border-b border-white/20 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm shadow-blue-500/5">
        <div className="flex h-14 items-center justify-between px-4 md:h-16">
          <div className="flex items-center gap-4">
            <Link href="/manage" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-violet-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative h-9 w-9 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
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
                    className="text-white"
                  >
                    <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                    <path d="M8 8v1" />
                    <path d="M12 8v1" />
                    <path d="M16 8v1" />
                    <rect width="20" height="12" x="2" y="9" rx="2" />
                    <circle cx="8" cy="15" r="2" />
                    <circle cx="16" cy="15" r="2" />
                  </svg>
                </div>
              </div>
              <span className="text-lg font-bold md:text-xl bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                Etags
              </span>
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center gap-2 md:gap-4">
                <Skeleton className="hidden h-4 w-24 sm:block" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            }
          >
            <UserProfileHeader userId={session.user.id} />
          </Suspense>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
