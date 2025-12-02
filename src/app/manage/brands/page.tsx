import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBrands } from '@/lib/actions/brands';
import { BrandsTable } from './brands-table';
import { BrandsHeader } from './brands-header';
import { Suspense } from 'react';
import { TableSkeleton } from '../table-skeleton';

async function BrandsTableWrapper() {
  const { brands } = await getBrands(1, 50);
  return <BrandsTable brands={brands} />;
}

export default async function BrandsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  return (
    <div className="space-y-6">
      <BrandsHeader />
      <div className="rounded-md border">
        <Suspense fallback={<TableSkeleton />}>
          <BrandsTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}
