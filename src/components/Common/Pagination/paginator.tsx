import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { generatePaginationLinks } from "./generate-pages";

type PaginatorProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext: boolean;
}

export default function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext,
}: PaginatorProps) {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <Pagination>
      <PaginationContent>
        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationPrevious
            className="cursor-pointer"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isFirstPage}  // Disable when on the first page
            />
          </PaginationItem>
        ) : null}

        {generatePaginationLinks(currentPage, totalPages, onPageChange)}

        {showPreviousNext && totalPages ? (
          <PaginationItem>
            <PaginationNext
            className="cursor-pointer"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLastPage}  // Disable when on the last page
            />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
