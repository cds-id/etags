'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TagForm } from './tag-form';

type Product = {
  id: number;
  code: string;
  metadata: unknown;
  brand: {
    id: number;
    name: string;
  };
};

type TagsHeaderProps = {
  products: Product[];
};

export function TagsHeader({ products }: TagsHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tags</h2>
          <p className="text-muted-foreground">
            Manage product tags for blockchain stamping
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={products.length === 0}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Create Tag
        </Button>
      </div>
      <TagForm open={open} onOpenChange={setOpen} products={products} />
    </>
  );
}
