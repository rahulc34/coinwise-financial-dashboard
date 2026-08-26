import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  fetchTransaction,
  fetchTransactionMetadata,
  fetchTransactions,
} from "../api/transactions";
import type { TransactionFilters } from "../types/transaction";

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
    placeholderData: keepPreviousData,
  });
}

export function useTransaction(transactionId: number | null) {
  return useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: () => fetchTransaction(transactionId!),
    enabled: transactionId !== null,
  });
}

export function useTransactionMetadata() {
  return useQuery({
    queryKey: ["transactions", "metadata"],
    queryFn: fetchTransactionMetadata,
    staleTime: 5 * 60 * 1000,
  });
}
