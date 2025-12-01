import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ProductsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <p className="text-muted-foreground">
          Manage products with dynamic templates
        </p>
      </div>
      <Button asChild>
        <Link href="/manage/products/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Link>
      </Button>
    </div>
  );
}
