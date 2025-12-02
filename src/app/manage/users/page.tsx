import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUsers, getUserStats } from '@/lib/actions/users';
import { UsersTable } from './users-table';
import { UsersHeader } from './users-header';
import { UserStatsCards } from './user-stats-cards';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

async function UsersTableWrapper({
  page,
  currentUserId,
}: {
  page: number;
  currentUserId: string;
}) {
  const { users, pagination } = await getUsers(page, 10);
  return (
    <>
      <UsersTable users={users} currentUserId={currentUserId} />
      <Pagination pagination={pagination} />
    </>
  );
}

async function UserStatsWrapper() {
  const stats = await getUserStats();
  return <UserStatsCards stats={stats} />;
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[120px] rounded-xl" />
      ))}
    </div>
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  return (
    <div className="space-y-6">
      <UsersHeader />

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <UserStatsWrapper />
      </Suspense>

      {/* Users Table */}
      <div className="rounded-md border">
        <Suspense>
          <UsersTableWrapper page={page} currentUserId={session.user.id} />
        </Suspense>
      </div>
    </div>
  );
}
