import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProducts } from '@/lib/actions/products';
import { getAllBrands } from '@/lib/actions/brands';
import { ProductsTable } from './products-table';
import { ProductsHeader } from './products-header';

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const [{ products }, brands] = await Promise.all([
    getProducts(1, 50),
    getAllBrands(),
  ]);

  return (
    <div className="space-y-6">
      <ProductsHeader brands={brands} />
      <div className="rounded-md border">
        <ProductsTable products={products} brands={brands} />
      </div>
    </div>
  );
}
