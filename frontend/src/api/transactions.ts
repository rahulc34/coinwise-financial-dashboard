import { apiRequest } from "./client";
import type {
  Transaction,
  TransactionFilters,
  TransactionListResponse,
  TransactionMetadata,
} from "../types/transaction";

function addParameter(
  parameters: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value !== undefined && value !== "") {
    parameters.set(key, String(value));
  }
}

export function fetchTransactions(filters: TransactionFilters) {
  const parameters = new URLSearchParams();

  addParameter(parameters, "page", filters.page);
  addParameter(parameters, "page_size", filters.pageSize);
  addParameter(parameters, "search", filters.search);
  addParameter(parameters, "category", filters.category);
  addParameter(parameters, "status", filters.status);
  addParameter(
    parameters,
    "date_from",
    filters.dateFrom ? `${filters.dateFrom}T00:00:00Z` : undefined,
  );
  addParameter(
    parameters,
    "date_to",
    filters.dateTo ? `${filters.dateTo}T23:59:59.999Z` : undefined,
  );
  addParameter(parameters, "amount_min", filters.amountMin);
  addParameter(parameters, "amount_max", filters.amountMax);
  addParameter(parameters, "sort_by", filters.sortBy);
  addParameter(parameters, "sort_order", filters.sortOrder);

  return apiRequest<TransactionListResponse>(
    `/transactions?${parameters.toString()}`,
  );
}

export function fetchTransaction(transactionId: number) {
  return apiRequest<Transaction>(`/transactions/${transactionId}`);
}

export function fetchTransactionMetadata() {
  return apiRequest<TransactionMetadata>("/transactions/meta");
}
