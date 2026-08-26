import { apiRequest } from "./client";
import type { CategoryAnalytics, AnalyticsSummary } from "../types/analytics";

export function fetchCategoryAnalytics() {
  return apiRequest<CategoryAnalytics>("/analytics/categories");
}

export function fetchAnalyticsSummary() {
  return apiRequest<AnalyticsSummary>("/analytics/summary");
}
