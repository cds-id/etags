import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type TagsHeaderProps = {
  hasProducts: boolean;
};

export function TagsHeader({ hasProducts }: TagsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tag</h2>
        <p className="text-muted-foreground">
          Kelola tag produk untuk pencapan blockchain
        </p>
      </div>
      {hasProducts ? (
        <Button asChild>
          <Link href="/manage/tags/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Tag
          </Link>
        </Button>
      ) : (
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Buat Tag
        </Button>
      )}
    </div>
  );
}
