import { apiRequest } from "./client";
import type { CategoryAnalytics } from "../types/analytics";

export function fetchCategoryAnalytics() {
  return apiRequest<CategoryAnalytics>("/analytics/categories");
}
