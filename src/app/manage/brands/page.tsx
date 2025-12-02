import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBrands, getBrandStats } from '@/lib/actions/brands';
import { BrandsTable } from './brands-table';
import { BrandsHeader } from './brands-header';
import { BrandStatsCards } from './brand-stats-cards';
import { Suspense } from 'react';
import { TableSkeleton } from '../table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

async function BrandsTableWrapper() {
  const { brands } = await getBrands(1, 50);
  return <BrandsTable brands={brands} />;
}

async function BrandStatsWrapper() {
  const stats = await getBrandStats();
  return <BrandStatsCards stats={stats} />;
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

export default async function BrandsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  return (
    <div className="space-y-6">
      <BrandsHeader />

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <BrandStatsWrapper />
      </Suspense>

      {/* Brands Table */}
      <div className="rounded-md border">
        <Suspense fallback={<TableSkeleton />}>
          <BrandsTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}
