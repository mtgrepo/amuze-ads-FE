import { PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import type { JSX } from "react";

export const generatePaginationLinks = (
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) => {
  const pages: JSX.Element[] = [];


  // If there are 3 or fewer pages, show all pages directly without ellipses
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
  } else {
    // Always show the first page
    pages.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => onPageChange(1)}
          isActive={1 === currentPage}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis after the first page if the current page is far from the start
    if (currentPage > 3) {
      pages.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    // Show pages around the current page (currentPage - 1, currentPage, currentPage + 1)
    const startPage = Math.max(currentPage - 1, 2); // Ensure we don’t go below page 2
    const endPage = Math.min(currentPage + 1, totalPages - 1); // Ensure we don’t go beyond the second-to-last page

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={i === currentPage}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis before the last page if the current page is far from the end
    if (currentPage < totalPages - 2) {
      pages.push(<PaginationEllipsis key="end-ellipsis" />);
    }

    // Always show the last page
    pages.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          onClick={() => onPageChange(totalPages)}
          isActive={totalPages === currentPage}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return pages;
};
