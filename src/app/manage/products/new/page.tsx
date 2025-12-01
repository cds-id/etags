import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllBrands } from '@/lib/actions/brands';
import { ProductFormPage } from '../_components/product-form-page';

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const brands = await getAllBrands();

  if (brands.length === 0) {
    redirect('/manage/brands');
  }

  return <ProductFormPage brands={brands} />;
}
