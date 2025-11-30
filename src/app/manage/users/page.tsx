import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUsers } from '@/lib/actions/users';
import { UsersTable } from './users-table';
import { UsersHeader } from './users-header';

export default async function UsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const { users } = await getUsers(1, 50);

  return (
    <div className="space-y-6">
      <UsersHeader />
      <div className="rounded-md border">
        <UsersTable users={users} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
