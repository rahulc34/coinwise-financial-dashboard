export interface CategorySpend {
  category: string;
  total_amount: string;
  transaction_count: number;
  percentage: string;
}

export interface CategoryAnalytics {
  items: CategorySpend[];
  total_spending: string;
}

export interface AnalyticsSummary {
  total_spending: string;
  transaction_count: number;
  successful_count: number;
  success_rate: string;
  top_category: string | null;
}
