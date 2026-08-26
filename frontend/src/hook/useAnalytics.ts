import { useQuery } from "@tanstack/react-query";

import {
  fetchAnalyticsSummary,
  fetchCategoryAnalytics,
} from "../api/analytics";

export function useCategoryAnalytics() {
  return useQuery({
    queryKey: ["analytics", "categories"],
    queryFn: fetchCategoryAnalytics,
    staleTime: 60_000,
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: fetchAnalyticsSummary,
    staleTime: 60_000,
  });
}
