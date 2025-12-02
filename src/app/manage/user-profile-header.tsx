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
  );
}
