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
