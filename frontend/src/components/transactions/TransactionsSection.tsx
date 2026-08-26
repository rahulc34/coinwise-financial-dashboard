import { useEffect, useState } from "react";

import { useDebounce } from "../../hook/useDebounce";
import {
  useTransactionMetadata,
  useTransactions,
} from "../../hook/useTransactions";
import type {
  SortField,
  Transaction,
  TransactionFilters,
} from "../../types/transaction";
import { Card } from "../ui/Card";
import { Pagination } from "./Pagination";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { TransactionFilterBar } from "./TransactionFilterBar";
import { TransactionTable } from "./TransactionTable";

const initialFilters: TransactionFilters = {
  page: 1,
  pageSize: 50,
  sortBy: "date",
  sortOrder: "desc",
};

interface TransactionsSectionProps {
  category?: string;
  onCategoryChange: (category: string | undefined) => void;
}

export function TransactionsSection({
  category,
  onCategoryChange,
}: TransactionsSectionProps) {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);

  const [searchText, setSearchText] = useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(searchText, 350);

  const { data, isLoading, isFetching, isError, refetch } =
    useTransactions(filters);

  const { data: metadata } = useTransactionMetadata();

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      page: 1,
      search: debouncedSearch.trim() || undefined,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      page: 1,
      category,
    }));
  }, [category]);

  function handleSort(field: SortField) {
    setFilters((current) => ({
      ...current,
      page: 1,
      sortBy: field,
      sortOrder:
        current.sortBy === field && current.sortOrder === "desc"
          ? "asc"
          : "desc",
    }));
  }

  function handleFiltersChange(nextFilters: TransactionFilters) {
    setFilters(nextFilters);

    if (nextFilters.category !== category) {
      onCategoryChange(nextFilters.category);
    }
  }

  function resetFilters() {
    setSearchText("");
    setFilters(initialFilters);
    onCategoryChange(undefined);
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-5">
          <div>
            <h2 className="text-lg font-bold text-heading">Transactions</h2>

            <p className="mt-1 text-sm text-body">
              Search, filter and review your payment history.
            </p>
          </div>

          {isFetching && !isLoading && (
            <span role="status" className="text-xs font-medium text-brand-700">
              Updating…
            </span>
          )}
        </div>

        <TransactionFilterBar
          filters={filters}
          metadata={metadata}
          searchText={searchText}
          onSearchChange={setSearchText}
          onFiltersChange={handleFiltersChange}
          onReset={resetFilters}
        />

        <TransactionTable
          transactions={data?.items ?? []}
          loading={isLoading}
          error={isError}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          onRetry={() => void refetch()}
          onRowClick={setSelectedTransaction}
        />

        {data && (
          <Pagination
            page={data.pagination.page}
            pageSize={data.pagination.page_size}
            totalItems={data.pagination.total_items}
            totalPages={data.pagination.total_pages}
            disabled={isFetching}
            onPageChange={(page) => {
              setFilters((current) => ({
                ...current,
                page,
              }));
            }}
          />
        )}
      </Card>

      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => {
          setSelectedTransaction(null);
        }}
      />
    </>
  );
}
