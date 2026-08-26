import {
  ArrowDownToLine,
  ChartNoAxesCombined,
  CircleCheckBig,
  CreditCard,
} from "lucide-react";

import { useAnalyticsSummary } from "../../hook/useAnalytics";
import { formatCurrency } from "../../utils/format";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

export function SummaryCards() {
  const { data, isLoading, isError } = useAnalyticsSummary();

  const cards = [
    {
      title: "Total spending",
      value: data ? formatCurrency(data.total_spending) : "—",
      description: "Successful positive payments",
      icon: CreditCard,
    },
    {
      title: "Transactions",
      value: data ? data.transaction_count.toLocaleString("en-IN") : "—",
      description: "Across all payment statuses",
      icon: ArrowDownToLine,
    },
    {
      title: "Success rate",
      value: data ? `${Number(data.success_rate).toFixed(1)}%` : "—",
      description: data
        ? `${data.successful_count.toLocaleString("en-IN")} successful payments`
        : "Successful payments",
      icon: CircleCheckBig,
    },
    {
      title: "Top category",
      value: data?.top_category ?? "—",
      description: "By successful spending",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <section
      aria-label="Account summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map(({ title, value, description, icon: Icon }) => (
        <Card key={title} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>

            {isError && (
              <span className="text-xs font-medium text-red-600">
                Unavailable
              </span>
            )}
          </div>

          <p className="mt-5 text-sm font-medium text-body">{title}</p>

          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-28" />
          ) : (
            <p
              className="mt-1 truncate text-xl font-bold tabular-nums text-heading"
              title={value}
            >
              {value}
            </p>
          )}

          <p className="mt-2 text-xs text-muted">{description}</p>
        </Card>
      ))}
    </section>
  );
}
