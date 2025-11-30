import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Sidebar } from './sidebar';
import { UserMenu } from './user-menu';
import Link from 'next/link';

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch fresh user data from database to get latest avatar
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: {
      name: true,
      email: true,
      role: true,
      avatar_url: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/manage" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                <path d="M8 8v1" />
                <path d="M12 8v1" />
                <path d="M16 8v1" />
                <rect width="20" height="12" x="2" y="9" rx="2" />
                <circle cx="8" cy="15" r="2" />
                <circle cx="16" cy="15" r="2" />
              </svg>
              <span className="text-xl font-semibold">Etags</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <UserMenu
              user={{
                name: user.name,
                email: user.email,
                image: user.avatar_url,
                role: user.role,
              }}
            />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
