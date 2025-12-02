import { prisma } from '@/lib/db';
import { UserMenu } from './user-menu';

export async function UserProfileHeader({ userId }: { userId: string }) {
  // Fetch fresh user data from database to get latest avatar
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      name: true,
      email: true,
      role: true,
      avatar_url: true,
    },
  });

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {user.name}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize px-2 py-0.5 rounded-full bg-linear-to-r from-blue-500/10 to-violet-500/10">
          {user.role}
        </span>
      </div>
      <UserMenu
        user={{
          name: user.name,
          email: user.email,
          image: user.avatar_url,
          role: user.role,
        }}
      />
    </div>
  );
}
