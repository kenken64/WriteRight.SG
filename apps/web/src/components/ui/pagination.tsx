'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export function Pagination({ currentPage, totalPages, buildHref, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const baseBtn =
    'inline-flex items-center justify-center rounded-md text-sm font-medium h-9 min-w-[36px] px-2 transition-colors';

  return (
    <nav aria-label="Pagination" className={cn('mt-8 flex items-center justify-center gap-1', className)}>
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={cn(baseBtn, 'text-muted-foreground hover:bg-muted')}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(baseBtn, 'pointer-events-none opacity-40')} aria-disabled>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className={cn(baseBtn, 'pointer-events-none')}>
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              baseBtn,
              p === currentPage
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={cn(baseBtn, 'text-muted-foreground hover:bg-muted')}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(baseBtn, 'pointer-events-none opacity-40')} aria-disabled>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
