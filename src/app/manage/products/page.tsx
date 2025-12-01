import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProducts } from '@/lib/actions/products';
import { ProductsTable } from './products-table';
import { ProductsHeader } from './products-header';

export default async function ProductsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const isAdmin = session.user.role === 'admin';
  const { products } = await getProducts(1, 50);

  return (
    <div className="space-y-6">
      <ProductsHeader isAdmin={isAdmin} />
      <div className="rounded-md border">
        <ProductsTable products={products} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
