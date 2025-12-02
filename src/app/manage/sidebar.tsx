'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

type SidebarProps = {
  isAdmin: boolean;
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  adminOnly: boolean;
  brandOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    title: 'Dasbor',
    href: '/manage',
    icon: (
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
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    adminOnly: false,
  },
  {
    title: 'Pengguna',
    href: '/manage/users',
    icon: (
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
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    title: 'Brand',
    href: '/manage/brands',
    icon: (
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
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    title: 'Brand Saya',
    href: '/manage/my-brand',
    icon: (
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
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
    adminOnly: false,
    brandOnly: true,
  },
  {
    title: 'Produk',
    href: '/manage/products',
    icon: (
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
      >
        <path d="m7.5 4.27 9 5.15" />
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    ),
    adminOnly: false,
  },
  {
    title: 'Tag',
    href: '/manage/tags',
    icon: (
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
      >
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
      </svg>
    ),
    adminOnly: false,
  },
  {
    title: 'Profil',
    href: '/manage/profile',
    icon: (
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
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
      </svg>
    ),
    adminOnly: false,
  },
];

function NavLinks({
  items,
  pathname,
  onItemClick,
}: {
  items: NavItem[];
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1.5 p-4">
      {items.map((item) => {
        const isActive =
          item.href === '/manage'
            ? pathname === '/manage'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-linear-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white hover:shadow-md'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-white/20'
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:scale-110'
              )}
            >
              <span
                className={cn(
                  'transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                )}
              >
                {item.icon}
              </span>
            </div>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const filteredItems = navItems.filter((item) => {
    // Admin-only items: only show for admin
    if (item.adminOnly) {
      return isAdmin;
    }
    // Brand-only items: only show for non-admin (brand users)
    if (item.brandOnly) {
      return !isAdmin;
    }
    // Regular items: show for everyone
    return true;
  });

  return (
    <>
      {/* Mobile menu button - shown in header on mobile */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className="h-14 w-14 rounded-2xl shadow-xl shadow-blue-500/30 bg-linear-to-br from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0"
            >
              <Menu className="h-6 w-6 text-white" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 p-0 border-r-0 bg-linear-to-b from-white via-blue-50/30 to-violet-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-violet-950/20"
          >
            <div className="border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Menu className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Menu
                </span>
              </div>
            </div>
            <NavLinks
              items={filteredItems}
              pathname={pathname}
              onItemClick={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm md:block">
        <NavLinks items={filteredItems} pathname={pathname} />
      </aside>
    </>
  );
}
