import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllProducts } from '@/lib/actions/products';
import { TagFormPage } from '../_components/tag-form-page';

export default async function NewTagPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const products = await getAllProducts();

  if (products.length === 0) {
    redirect('/manage/products');
  }

  return <TagFormPage products={products} />;
}
