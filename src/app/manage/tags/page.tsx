import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTags, getAllTagScanLocations } from '@/lib/actions/tags';
import { getAllProducts } from '@/lib/actions/products';
import { TagsTable } from './tags-table';
import { TagsHeader } from './tags-header';
import { ScanStatsCards } from './scan-stats-cards';
import { ScanMapSection } from './scan-map-section';
import { Suspense } from 'react';
import { TableSkeleton } from '../table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

async function TagsTableWrapper({ page }: { page: number }) {
  const { tags, pagination } = await getTags(page, 10);
  return (
    <>
      <TagsTable tags={tags} />
      <Pagination pagination={pagination} />
    </>
  );
}

async function ScanStatsWrapper() {
  const stats = await getAllTagScanLocations();
  return <ScanStatsCards stats={stats} />;
}

async function ScanMapWrapper() {
  const stats = await getAllTagScanLocations();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  return (
    <ScanMapSection locations={stats.locations} accessToken={mapboxToken} />
  );
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

function MapSkeleton() {
  return <Skeleton className="h-[480px] rounded-xl" />;
}

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const products = await getAllProducts();
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  return (
    <div className="space-y-6">
      <TagsHeader hasProducts={products.length > 0} />

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <ScanStatsWrapper />
      </Suspense>

      {/* Map Section */}
      <Suspense fallback={<MapSkeleton />}>
        <ScanMapWrapper />
      </Suspense>

      {/* Tags Table */}
      <div className="rounded-md border">
        <Suspense fallback={<TableSkeleton />}>
          <TagsTableWrapper page={page} />
        </Suspense>
      </div>
    </div>
  );
}
