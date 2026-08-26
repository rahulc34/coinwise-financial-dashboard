import { Coins, WalletCards } from "lucide-react";

interface HeaderProps {
  coinBalance?: number;
  loading?: boolean;
}

export function Header({ coinBalance, loading = false }: HeaderProps) {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <WalletCards aria-hidden="true" className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-heading">
              Coinwise
            </p>

            <p className="hidden text-xs text-muted sm:block">
              Spend smarter. Earn more.
            </p>
          </div>
        </div>

        <div
          aria-label="Available reward coins"
          className="flex items-center gap-2 rounded-xl border border-coin-100 bg-coin-50 px-3 py-2"
        >
          <Coins aria-hidden="true" className="h-5 w-5 text-coin-500" />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-coin-600">
              Coin balance
            </p>

            <p className="text-sm font-bold tabular-nums text-heading">
              {loading
                ? "Loading…"
                : (coinBalance ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
