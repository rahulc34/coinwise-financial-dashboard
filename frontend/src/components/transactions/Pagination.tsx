import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../ui/Button";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-body">
        Showing{" "}
        <span className="font-semibold text-heading">
          {firstItem.toLocaleString("en-IN")}–{lastItem.toLocaleString("en-IN")}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-heading">
          {totalItems.toLocaleString("en-IN")}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </Button>

        <span className="min-w-20 text-center text-sm font-medium text-body">
          {page} / {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
