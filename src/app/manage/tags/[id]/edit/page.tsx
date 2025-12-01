import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getAllProducts } from '@/lib/actions/products';
import { getTagById, getTagUrls } from '@/lib/actions/tags';
import { TagFormPage } from '../../_components/tag-form-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTagPage({ params }: Props) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/manage');
  }

  const { id } = await params;
  const tagId = parseInt(id);

  if (isNaN(tagId)) {
    notFound();
  }

  const [tag, products, tagUrls] = await Promise.all([
    getTagById(tagId),
    getAllProducts(),
    getTagUrls(tagId),
  ]);

  if (!tag) {
    notFound();
  }

  return <TagFormPage tag={tag} products={products} tagUrls={tagUrls} />;
}
