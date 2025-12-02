import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProducts } from '@/lib/actions/products';
import { ProductsTable } from './products-table';
import { ProductsHeader } from './products-header';
import { Suspense } from 'react';
import { TableSkeleton } from '../table-skeleton';

async function ProductsTableWrapper({ isAdmin }: { isAdmin: boolean }) {
  const { products } = await getProducts(1, 50);
  return <ProductsTable products={products} isAdmin={isAdmin} />;
}

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="space-y-6">
      <ProductsHeader isAdmin={isAdmin} />
      <div className="rounded-md border">
        <Suspense fallback={<TableSkeleton />}>
          <ProductsTableWrapper isAdmin={isAdmin} />
        </Suspense>
      </div>
    </div>
  );
}
