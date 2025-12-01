import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getAllBrands } from '@/lib/actions/brands';
import { ProductFormPage } from '../_components/product-form-page';

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/manage');
  }

  const isAdmin = session.user.role === 'admin';

  // For brand users, get their brand directly
  if (!isAdmin) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { brand: true },
    });

    if (!user?.brand) {
      redirect('/manage/onboarding');
    }

    const brands = [{ id: user.brand.id, name: user.brand.name }];
    return <ProductFormPage brands={brands} isAdmin={false} />;
  }

  // For admin, get all brands
  const brands = await getAllBrands();

  if (brands.length === 0) {
    redirect('/manage/brands');
  }

  return <ProductFormPage brands={brands} isAdmin={true} />;
}
