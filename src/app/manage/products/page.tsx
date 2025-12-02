import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProducts, getProductStats } from '@/lib/actions/products';
import { ProductsTable } from './products-table';
import { ProductsHeader } from './products-header';
import { ProductStatsCards } from './product-stats-cards';
import { Suspense } from 'react';
import { TableSkeleton } from '../table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

async function ProductsTableWrapper({ isAdmin }: { isAdmin: boolean }) {
  const { products } = await getProducts(1, 50);
  return <ProductsTable products={products} isAdmin={isAdmin} />;
}

async function ProductStatsWrapper() {
  const stats = await getProductStats();
  return <ProductStatsCards stats={stats} />;
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

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="space-y-6">
      <ProductsHeader isAdmin={isAdmin} />

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <ProductStatsWrapper />
      </Suspense>

      {/* Products Table */}
      <div className="rounded-md border">
        <Suspense fallback={<TableSkeleton />}>
          <ProductsTableWrapper isAdmin={isAdmin} />
        </Suspense>
      </div>
    </div>
  );
}
