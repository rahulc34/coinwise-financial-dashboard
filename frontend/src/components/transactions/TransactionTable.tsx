import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Inbox,
  RotateCcw,
} from "lucide-react";

import type {
  SortField,
  SortOrder,
  Transaction,
} from "../../types/transaction";
import { formatCurrency, formatDate } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  error: boolean;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onRetry: () => void;
  onRowClick: (transaction: Transaction) => void;
}

interface SortButtonProps {
  label: string;
  field: SortField;
  activeField: SortField;
  order: SortOrder;
  onSort: (field: SortField) => void;
}

function SortButton({
  label,
  field,
  activeField,
  order,
  onSort,
}: SortButtonProps) {
  const active = field === activeField;

  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md text-left font-semibold text-body transition-colors hover:text-heading"
      onClick={() => onSort(field)}
    >
      {label}
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );
}

function getStatusVariant(transaction: Transaction) {
  if (transaction.is_refund) {
    return "refund" as const;
  }

  switch (transaction.status) {
    case "SUCCESS":
      return "success" as const;
    case "FAILED":
      return "failed" as const;
    case "PENDING":
      return "pending" as const;
    default:
      return "neutral" as const;
  }
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <tr key={index} className="border-b border-border">
          <td className="px-5 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </td>

          <td className="px-5 py-4">
            <Skeleton className="h-4 w-24" />
          </td>

          <td className="hidden px-5 py-4 md:table-cell">
            <Skeleton className="h-4 w-24" />
          </td>

          <td className="hidden px-5 py-4 lg:table-cell">
            <Skeleton className="h-4 w-20" />
          </td>

          <td className="px-5 py-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>

          <td className="px-5 py-4">
            <Skeleton className="ml-auto h-4 w-24" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function TransactionTable({
  transactions,
  loading,
  error,
  sortBy,
  sortOrder,
  onSort,
  onRetry,
  onRowClick,
}: TransactionTableProps) {
  if (error) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <RotateCcw aria-hidden="true" className="h-5 w-5" />
        </div>

        <h3 className="mt-4 font-semibold text-heading">
          Transactions could not be loaded
        </h3>

        <p className="mt-1 max-w-sm text-sm text-body">
          Check that the backend is running and try again.
        </p>

        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!loading && transactions.length === 0) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-muted">
          <Inbox aria-hidden="true" className="h-5 w-5" />
        </div>

        <h3 className="mt-4 font-semibold text-heading">
          No transactions found
        </h3>

        <p className="mt-1 max-w-sm text-sm text-body">
          Try changing or clearing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <caption className="sr-only">Credit-card payment transactions</caption>

        <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur">
          <tr className="border-y border-border text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-5 py-3">
              Merchant
            </th>

            <th scope="col" className="px-5 py-3">
              <SortButton
                label="Date"
                field="date"
                activeField={sortBy}
                order={sortOrder}
                onSort={onSort}
              />
            </th>

            <th scope="col" className="hidden px-5 py-3 md:table-cell">
              Category
            </th>

            <th scope="col" className="hidden px-5 py-3 lg:table-cell">
              Payment
            </th>

            <th scope="col" className="px-5 py-3">
              Status
            </th>

            <th scope="col" className="px-5 py-3 text-right">
              <SortButton
                label="Amount"
                field="amount"
                activeField={sortBy}
                order={sortOrder}
                onSort={onSort}
              />
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <LoadingRows />
          ) : (
            transactions.map((transaction) => (
              <tr
                key={transaction.id}
                tabIndex={0}
                role="button"
                aria-label={`View ${transaction.merchant} transaction details`}
                className="cursor-pointer border-b border-border bg-white transition-colors hover:bg-brand-50/50 focus-visible:bg-brand-50"
                onClick={() => onRowClick(transaction)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(transaction);
                  }
                }}
              >
                <td className="px-5 py-4">
                  <p className="max-w-52 truncate text-sm font-semibold text-heading">
                    {transaction.merchant}
                  </p>

                  <p className="mt-1 font-mono text-xs text-muted">
                    {transaction.transaction_id}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-sm text-body">
                  {formatDate(transaction.occurred_at)}
                </td>

                <td className="hidden px-5 py-4 text-sm text-body md:table-cell">
                  {transaction.category}
                </td>

                <td className="hidden px-5 py-4 text-sm text-body lg:table-cell">
                  {transaction.payment_method}
                </td>

                <td className="px-5 py-4">
                  <Badge variant={getStatusVariant(transaction)}>
                    {transaction.is_refund ? "REFUND" : transaction.status}
                  </Badge>
                </td>

                <td
                  className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold tabular-nums ${
                    transaction.is_refund ? "text-violet-700" : "text-heading"
                  }`}
                >
                  {formatCurrency(transaction.amount, transaction.currency)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
