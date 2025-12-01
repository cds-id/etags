import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getAllBrands } from '@/lib/actions/brands';
import { getProductById } from '@/lib/actions/products';
import { ProductFormPage } from '../../_components/product-form-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    notFound();
  }

  const isAdmin = session.user.role === 'admin';

  // For brand users, get product and verify it belongs to their brand
  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { brand: true },
    });

    if (!user?.brand) {
      redirect('/manage/onboarding');
    }

    const product = await getProductById(productId);

    if (!product) {
      notFound();
    }

    const brands = [{ id: user.brand.id, name: user.brand.name }];
    return (
      <ProductFormPage product={product} brands={brands} isAdmin={false} />
    );
  }

  // For admin
  const [product, brands] = await Promise.all([
    getProductById(productId),
    getAllBrands(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductFormPage product={product} brands={brands} isAdmin={true} />;
}
