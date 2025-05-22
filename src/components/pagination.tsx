"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  siblingCount?: number;
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  siblingCount = 1,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / pageSize);

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Generate page numbers to display
  const generatePaginationItems = () => {
    const items: (number | "ellipsis")[] = [];

    // Always show first page
    items.push(1);

    // Calculate range based on current page and sibling count
    const leftSibling = Math.max(currentPage - siblingCount, 2);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

    // Add ellipsis if there's a gap between first page and left sibling
    if (leftSibling > 2) {
      items.push("ellipsis");
    }

    // Add pages between left and right siblings
    for (let i = leftSibling; i <= rightSibling; i++) {
      items.push(i);
    }

    // Add ellipsis if there's a gap between right sibling and last page
    if (rightSibling < totalPages - 1) {
      items.push("ellipsis");
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  const paginationItems = generatePaginationItems();

  return (
    <div className="flex items-center justify-center space-x-1.5">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
        className="h-8 w-8"
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">First page</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      <div className="flex items-center space-x-1.5">
        {paginationItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={item}
              variant={currentPage === item ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(item)}
              className={cn(
                "h-8 w-8",
                currentPage === item && "pointer-events-none",
              )}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
        className="h-8 w-8"
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">Last page</span>
      </Button>
    </div>
  );
}
