'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BrandForm } from './brand-form';

export function BrandsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Brands</h2>
          <p className="text-muted-foreground">
            Manage product brands and logos
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
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
          Add Brand
        </Button>
      </div>
      <BrandForm open={open} onOpenChange={setOpen} />
    </>
  );
}
