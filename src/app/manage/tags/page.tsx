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

async function TagsTableWrapper() {
  const { tags } = await getTags(1, 50);
  return <TagsTable tags={tags} />;
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

export default async function TagsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const products = await getAllProducts();

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
          <TagsTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}
