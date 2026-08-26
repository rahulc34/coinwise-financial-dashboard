import { useQuery } from "@tanstack/react-query";

import { fetchCategoryAnalytics } from "../api/analytics";

export function useCategoryAnalytics() {
  return useQuery({
    queryKey: ["analytics", "categories"],
    queryFn: fetchCategoryAnalytics,
    staleTime: 60_000,
  });
}
