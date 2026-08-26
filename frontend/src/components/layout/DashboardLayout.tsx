import type { ReactNode } from "react";

import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  coinBalance?: number;
  balanceLoading?: boolean;
}

export function DashboardLayout({
  children,
  coinBalance,
  balanceLoading,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header coinBalance={coinBalance} loading={balanceLoading} />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
