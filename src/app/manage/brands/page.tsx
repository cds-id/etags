import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBrands } from '@/lib/actions/brands';
import { BrandsTable } from './brands-table';
import { BrandsHeader } from './brands-header';

export default async function BrandsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const { brands } = await getBrands(1, 50);

  return (
    <div className="space-y-6">
      <BrandsHeader />
      <div className="rounded-md border">
        <BrandsTable brands={brands} />
      </div>
    </div>
  );
}
