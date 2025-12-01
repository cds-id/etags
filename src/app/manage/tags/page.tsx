import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTags } from '@/lib/actions/tags';
import { getAllProducts } from '@/lib/actions/products';
import { TagsTable } from './tags-table';
import { TagsHeader } from './tags-header';

export default async function TagsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const [{ tags }, products] = await Promise.all([
    getTags(1, 50),
    getAllProducts(),
  ]);

  return (
    <div className="space-y-6">
      <TagsHeader hasProducts={products.length > 0} />
      <div className="rounded-md border">
        <TagsTable tags={tags} />
      </div>
    </div>
  );
}
