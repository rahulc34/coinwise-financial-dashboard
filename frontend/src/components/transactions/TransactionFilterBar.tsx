import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import type {
  TransactionFilters,
  TransactionMetadata,
  TransactionStatus,
} from "../../types/transaction";
import { Button } from "../ui/Button";

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  metadata?: TransactionMetadata;
  searchText: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

const inputClasses =
  "h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-heading " +
  "transition-colors placeholder:text-muted hover:border-gray-300 " +
  "focus:border-brand-500";

export function TransactionFilterBar({
  filters,
  metadata,
  searchText,
  onSearchChange,
  onFiltersChange,
  onReset,
}: TransactionFilterBarProps) {
  function updateFilter(updates: Partial<TransactionFilters>) {
    onFiltersChange({
      ...filters,
      ...updates,
      page: 1,
    });
  }

  return (
    <div className="border-y border-border bg-gray-50/60 px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal
          aria-hidden="true"
          className="h-4 w-4 text-brand-700"
        />

        <p className="text-sm font-semibold text-heading">Filters</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Search merchants</span>

          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />

          <input
            type="search"
            value={searchText}
            placeholder="Search merchant names…"
            className={`${inputClasses} pl-9`}
            onChange={(event) => {
              onSearchChange(event.target.value);
            }}
          />
        </label>

        <label>
          <span className="sr-only">Category</span>

          <select
            value={filters.category ?? ""}
            className={inputClasses}
            onChange={(event) => {
              updateFilter({
                category: event.target.value || undefined,
              });
            }}
          >
            <option value="">All categories</option>

            {metadata?.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Payment status</span>

          <select
            value={filters.status ?? ""}
            className={inputClasses}
            onChange={(event) => {
              updateFilter({
                status: (event.target.value as TransactionStatus) || undefined,
              });
            }}
          >
            <option value="">All statuses</option>
            <option value="SUCCESS">Successful</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-body">
            From date
          </span>

          <input
            type="date"
            value={filters.dateFrom ?? ""}
            min={metadata?.earliest_date.slice(0, 10)}
            max={filters.dateTo ?? metadata?.latest_date.slice(0, 10)}
            className={inputClasses}
            onChange={(event) => {
              updateFilter({
                dateFrom: event.target.value || undefined,
              });
            }}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-body">
            To date
          </span>

          <input
            type="date"
            value={filters.dateTo ?? ""}
            min={filters.dateFrom ?? metadata?.earliest_date.slice(0, 10)}
            max={metadata?.latest_date.slice(0, 10)}
            className={inputClasses}
            onChange={(event) => {
              updateFilter({
                dateTo: event.target.value || undefined,
              });
            }}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-body">
            Minimum amount
          </span>

          <input
            type="number"
            step="0.01"
            value={filters.amountMin ?? ""}
            placeholder={metadata?.minimum_amount ?? "0"}
            className={inputClasses}
            onChange={(event) => {
              updateFilter({
                amountMin: event.target.value || undefined,
              });
            }}
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-medium text-body">
            Maximum amount
          </span>

          <input
            type="number"
            step="0.01"
            value={filters.amountMax ?? ""}
            placeholder={metadata?.maximum_amount ?? "10000"}
            className={inputClasses}
            onChange={(event) => {
              updateFilter({
                amountMax: event.target.value || undefined,
              });
            }}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-body">
          Rows per page
          <select
            value={filters.pageSize}
            className="h-9 rounded-lg border border-border bg-white px-2 text-sm text-heading"
            onChange={(event) => {
              updateFilter({
                pageSize: Number(event.target.value),
              });
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}
