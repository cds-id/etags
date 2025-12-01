import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getAllBrands } from '@/lib/actions/brands';
import { getProductById } from '@/lib/actions/products';
import { ProductFormPage } from '../../_components/product-form-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const [product, brands] = await Promise.all([
    getProductById(productId),
    getAllBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductFormPage product={product} brands={brands} />;
}
