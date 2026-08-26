import { useState } from "react";
import { CategorySpendChart } from "./components/analytics/CategorySpendChart";
import { SummaryCards } from "./components/analytics/SummaryCards";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { useWalletBalance } from "./hook/useRewards";
import { TransactionsSection } from "./components/transactions/TransactionsSection";
import { RewardsSection } from "./components/rewards/RewardsSection";

function App() {
  const { data: wallet, isLoading: isBalanceLoading } = useWalletBalance();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );

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

      <SummaryCards />

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

      <RewardsSection />
    </DashboardLayout>
  );
}

export default App;
