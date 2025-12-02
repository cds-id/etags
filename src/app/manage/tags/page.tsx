import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTags } from '@/lib/actions/tags';
import { getAllProducts } from '@/lib/actions/products';
import { TagsTable } from './tags-table';
import { TagsHeader } from './tags-header';
import { Suspense } from 'react';
import { TableSkeleton } from '../table-skeleton';

async function TagsTableWrapper() {
  const { tags } = await getTags(1, 50);
  return <TagsTable tags={tags} />;
}

export default async function TagsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <TagsHeader hasProducts={products.length > 0} />
      <div className="rounded-md border">
        <Suspense fallback={<TableSkeleton />}>
          <TagsTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}
