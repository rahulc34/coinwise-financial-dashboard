import {
  ArrowDownToLine,
  ChartNoAxesCombined,
  CreditCard,
  Gift,
} from "lucide-react";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Card } from "./components/ui/Card";
import { Skeleton } from "./components/ui/Skeleton";
import { useWalletBalance } from "./hook/useRewards";
import { TransactionsSection } from "./components/transactions/TransactionsSection";

const summaryCards = [
  {
    title: "Total spending",
    description: "Successful payments",
    icon: CreditCard,
  },
  {
    title: "Transactions",
    description: "Across all categories",
    icon: ArrowDownToLine,
  },
  {
    title: "Top category",
    description: "Based on your spending",
    icon: ChartNoAxesCombined,
  },
];

function App() {
  const { data: wallet, isLoading: isBalanceLoading } = useWalletBalance();

  return (
    <DashboardLayout
      coinBalance={wallet?.coin_balance}
      balanceLoading={isBalanceLoading}
    >
      <section className="mb-6">
        <p className="mb-1 text-sm font-semibold text-brand-700">
          Financial overview
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
          Your spending dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-body">
          Review transactions, understand where your money goes, and redeem the
          coins you have earned.
        </p>
      </section>

      <section
        aria-label="Account summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summaryCards.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>

            <p className="text-sm font-medium text-body">{title}</p>

            <Skeleton className="mt-2 h-7 w-28" />

            <p className="mt-2 text-xs text-muted">{description}</p>
          </Card>
        ))}

        <Card className="overflow-hidden border-coin-100 bg-gradient-to-br from-coin-50 to-white p-5">
          <div className="flex h-full flex-col justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coin-100 text-coin-600">
              <Gift aria-hidden="true" className="h-5 w-5" />
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-heading">
                Rewards waiting
              </p>

              <p className="mt-1 text-xs leading-5 text-body">
                Turn your earned coins into vouchers and cashback.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TransactionsSection />
        <Card className="min-h-[420px] p-5">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading">
              Recent transactions
            </h2>

            <p className="mt-1 text-sm text-body">
              Your transaction table will appear here.
            </p>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border-b border-border pb-4"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />

                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>

                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-[420px] p-5">
          <h2 className="text-lg font-bold text-heading">
            Spending by category
          </h2>

          <p className="mt-1 text-sm text-body">
            Your analytics chart will appear here.
          </p>

          <div className="flex h-72 items-center justify-center">
            <Skeleton className="h-52 w-52 rounded-full" />
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}

export default App;
