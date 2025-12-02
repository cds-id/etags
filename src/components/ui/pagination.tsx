'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type PaginationProps = {
  pagination: PaginationInfo;
};

export function Pagination({ pagination }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages, total, limit } = pagination;

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Menampilkan {startItem} - {endItem} dari {total} data
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={page === 1}
          aria-label="First page"
        >
          {page === 1 ? (
            <span>
              <ChevronsLeft className="h-4 w-4" />
            </span>
          ) : (
            <Link href={createPageURL(1)}>
              <ChevronsLeft className="h-4 w-4" />
            </Link>
          )}
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={page === 1}
          aria-label="Previous page"
        >
          {page === 1 ? (
            <span>
              <ChevronLeft className="h-4 w-4" />
            </span>
          ) : (
            <Link href={createPageURL(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first page, last page, current page, and 2 pages before/after current
              if (p === 1 || p === totalPages) return true;
              if (p >= page - 2 && p <= page + 2) return true;
              return false;
            })
            .map((p, idx, arr) => {
              // Show ellipsis if there's a gap
              const prevPage = arr[idx - 1];
              const showEllipsis = prevPage && p - prevPage > 1;

              return (
                <div key={p} className="flex items-center gap-1">
                  {showEllipsis && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={page === p ? 'default' : 'outline'}
                    size="icon-sm"
                    asChild={page !== p}
                    disabled={page === p}
                  >
                    {page === p ? (
                      <span>{p}</span>
                    ) : (
                      <Link href={createPageURL(p)}>{p}</Link>
                    )}
                  </Button>
                </div>
              );
            })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={page === totalPages}
          aria-label="Next page"
        >
          {page === totalPages ? (
            <span>
              <ChevronRight className="h-4 w-4" />
            </span>
          ) : (
            <Link href={createPageURL(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon-sm"
          asChild
          disabled={page === totalPages}
          aria-label="Last page"
        >
          {page === totalPages ? (
            <span>
              <ChevronsRight className="h-4 w-4" />
            </span>
          ) : (
            <Link href={createPageURL(totalPages)}>
              <ChevronsRight className="h-4 w-4" />
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
