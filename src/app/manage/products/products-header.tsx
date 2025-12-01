import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type ProductsHeaderProps = {
  isAdmin?: boolean;
};

export function ProductsHeader({ isAdmin = true }: ProductsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Produk</h2>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Kelola produk dengan template dinamis'
            : 'Kelola produk brand Anda'}
        </p>
      </div>
      <Button asChild>
        <Link href="/manage/products/new">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Link>
      </Button>
    </div>
  );
}
