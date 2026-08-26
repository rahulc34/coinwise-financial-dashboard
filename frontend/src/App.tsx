import {
  ArrowDownToLine,
  ChartNoAxesCombined,
  CreditCard,
  Gift,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CategorySpendChart } from "./components/analytics/CategorySpendChart";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Card } from "./components/ui/Card";
import { Skeleton } from "./components/ui/Skeleton";
import { useWalletBalance } from "./hook/useRewards";
import { TransactionsSection } from "./components/transactions/TransactionsSection";
import { RewardsSection } from "./components/rewards/RewardsSection";

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
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const [showRewards, setShowRewards] = useState(false);
  const rewardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showRewards) {
      return;
    }

    rewardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showRewards]);

  function openRewards() {
    if (showRewards) {
      rewardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setShowRewards(true);
  }

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

        <Card
          role="button"
          tabIndex={0}
          aria-expanded={showRewards}
          aria-controls="rewards-section"
          className="cursor-pointer overflow-hidden border-coin-100 bg-gradient-to-br from-coin-50 to-white p-5 text-left transition hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coin-600"
          onClick={openRewards}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openRewards();
            }
          }}
        >
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
        <TransactionsSection
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <CategorySpendChart
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </section>

      {showRewards ? (
        <div id="rewards-section" ref={rewardsRef}>
          <RewardsSection />
        </div>
      ) : null}
    </DashboardLayout>
  );
}

export default App;
