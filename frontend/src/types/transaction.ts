export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING";

export type SortField = "date" | "amount";
export type SortOrder = "asc" | "desc";

export interface Transaction {
  id: number;
  transaction_id: string;
  occurred_at: string;
  merchant: string;
  category: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  payment_method: string;
  is_refund: boolean;
  reward_coins: number;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  pagination: Pagination;
}

export interface TransactionMetadata {
  categories: string[];
  statuses: TransactionStatus[];
  minimum_amount: string;
  maximum_amount: string;
  earliest_date: string;
  latest_date: string;
}

export interface TransactionFilters {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}
