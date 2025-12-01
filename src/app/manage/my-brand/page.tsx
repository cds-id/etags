import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { BrandInfoForm } from './brand-info-form';
import { BrandLogoForm } from './brand-logo-form';

export default async function MyBrandPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Only brand users can access this page
  if (session.user.role !== 'brand') {
    redirect('/manage');
  }

  // Get user with brand info
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    include: {
      brand: true,
    },
  });

  if (!user?.brand) {
    redirect('/manage');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Brand Saya</h2>
        <p className="text-muted-foreground">Kelola informasi brand Anda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <BrandInfoForm
            brand={{
              id: user.brand.id,
              name: user.brand.name,
              descriptions: user.brand.descriptions,
            }}
          />
        </div>
        <div>
          <BrandLogoForm
            brand={{
              id: user.brand.id,
              name: user.brand.name,
              logo_url: user.brand.logo_url,
            }}
          />
        </div>
      </div>
    </div>
  );
}
