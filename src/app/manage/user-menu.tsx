'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/actions/auth';

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-xl p-0 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all"
        >
          <Avatar className="h-10 w-10 rounded-xl">
            <AvatarImage src={user.image || undefined} className="rounded-xl" />
            <AvatarFallback className="rounded-xl bg-linear-to-br from-blue-500 to-violet-600 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 p-2 rounded-xl border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-blue-500/10"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-3 rounded-lg bg-linear-to-br from-blue-500/10 via-violet-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage
                src={user.image || undefined}
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-lg bg-linear-to-br from-blue-500 to-violet-600 text-white font-semibold text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-slate-200/50 dark:bg-slate-800/50" />
        <DropdownMenuItem
          asChild
          className="rounded-lg px-3 py-2.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 focus:bg-blue-50 dark:focus:bg-blue-950/50"
        >
          <Link href="/manage/profile" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
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
                className="text-blue-600 dark:text-blue-400"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
              </svg>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              Profil
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 bg-slate-200/50 dark:bg-slate-800/50" />
        <DropdownMenuItem
          asChild
          className="rounded-lg px-3 py-2.5 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/50 focus:bg-red-50 dark:focus:bg-red-950/50"
        >
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-3 text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
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
                  className="text-red-600 dark:text-red-400"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </div>
              <span className="font-medium text-red-600 dark:text-red-400">
                Keluar
              </span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
