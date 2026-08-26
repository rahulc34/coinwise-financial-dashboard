import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartNoAxesCombined } from "lucide-react";

import { useCategoryAnalytics } from "../../hook/useAnalytics";
import { formatCurrency } from "../../utils/format";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

const COLORS = [
  "#099473",
  "#2563eb",
  "#7c3aed",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#4f46e5",
  "#64748b",
];

interface CategorySpendChartProps {
  selectedCategory?: string;
  onCategorySelect: (category: string | undefined) => void;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: {
    category: string;
    totalAmount: number;
    transactionCount: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-lg">
      <p className="text-sm font-semibold text-heading">{item.category}</p>

      <p className="mt-1 text-sm text-body">
        {formatCurrency(item.totalAmount)}
      </p>

      <p className="mt-1 text-xs text-muted">
        {item.transactionCount.toLocaleString("en-IN")} transactions
      </p>
    </div>
  );
}

export function CategorySpendChart({
  selectedCategory,
  onCategorySelect,
}: CategorySpendChartProps) {
  const { data, isLoading, isError, refetch } = useCategoryAnalytics();

  if (isLoading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-2 h-4 w-60" />

        <div className="flex h-72 items-center justify-center">
          <Skeleton className="h-52 w-52 rounded-full" />
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="flex min-h-[420px] flex-col items-center justify-center p-6 text-center">
        <ChartNoAxesCombined className="h-8 w-8 text-muted" />

        <p className="mt-3 font-semibold text-heading">
          Analytics could not be loaded
        </p>

        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </Card>
    );
  }

  const chartData = data.items.map((item) => ({
    category: item.category,
    totalAmount: Number(item.total_amount),
    transactionCount: item.transaction_count,
    percentage: Number(item.percentage),
  }));

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-heading">
            Spending by category
          </h2>

          <p className="mt-1 text-sm text-body">
            Click a category to filter transactions.
          </p>
        </div>

        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCategorySelect(undefined)}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="totalAmount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
              onClick={(item) => {
                const category =
                  typeof item.name === "string" ? item.name : undefined;

                onCategorySelect(
                  selectedCategory === category ? undefined : category,
                );
              }}
            >
              {chartData.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={COLORS[index % COLORS.length]}
                  cursor="pointer"
                  opacity={
                    selectedCategory && selectedCategory !== item.category
                      ? 0.3
                      : 1
                  }
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs font-medium text-muted">Total spending</p>

          <p className="mt-1 text-lg font-bold text-heading">
            {formatCurrency(data.total_spending)}
          </p>
        </div>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {chartData.map((item, index) => {
          const selected = selectedCategory === item.category;

          return (
            <button
              key={item.category}
              type="button"
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                selected ? "bg-brand-50" : "hover:bg-gray-50"
              }`}
              onClick={() => {
                onCategorySelect(selected ? undefined : item.category);
              }}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  background: COLORS[index % COLORS.length],
                }}
              />

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-body">
                {item.category}
              </span>

              <span className="text-xs font-semibold tabular-nums text-heading">
                {item.percentage.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
