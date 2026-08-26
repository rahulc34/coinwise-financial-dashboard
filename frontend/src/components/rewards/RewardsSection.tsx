import { useState } from "react";
import {
  BadgeIndianRupee,
  CheckCircle2,
  Coins,
  Gift,
  RotateCcw,
  Ticket,
  XCircle,
} from "lucide-react";

import {
  useRedeemReward,
  useRewardCatalogue,
  useWalletBalance,
} from "../../hook/useRewards";
import type { Redemption, Reward } from "../../types/reward";
import { formatCurrency } from "../../utils/format";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Skeleton } from "../ui/Skeleton";

export function RewardsSection() {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const [successfulRedemption, setSuccessfulRedemption] =
    useState<Redemption | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: catalogue, isLoading, isError, refetch } = useRewardCatalogue();

  const { data: wallet } = useWalletBalance();

  const redeemMutation = useRedeemReward();

  function confirmRedemption() {
    if (!selectedReward) {
      return;
    }

    setErrorMessage(null);
    setSuccessfulRedemption(null);

    redeemMutation.mutate(
      {
        rewardId: selectedReward.id,
        coinCost: selectedReward.coin_cost,
      },
      {
        onSuccess: (redemption) => {
          setSuccessfulRedemption(redemption);
          setSelectedReward(null);
        },

        onError: (error) => {
          setErrorMessage(error.message);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="mb-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="mt-5 h-5 w-32" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-6 h-10 w-full" />
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <Card className="mt-6 flex min-h-60 flex-col items-center justify-center p-6 text-center">
        <RotateCcw className="h-8 w-8 text-muted" />

        <h2 className="mt-3 font-semibold text-heading">
          Rewards could not be loaded
        </h2>

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

  return (
    <section aria-labelledby="rewards-heading" className="mt-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            Earn and redeem
          </p>

          <h2
            id="rewards-heading"
            className="mt-1 text-2xl font-bold tracking-tight text-heading"
          >
            Rewards catalogue
          </h2>

          <p className="mt-2 text-sm text-body">
            Use your coins for cashback and vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-coin-100 bg-coin-50 px-4 py-3">
          <Coins aria-hidden="true" className="h-5 w-5 text-coin-500" />

          <p className="text-sm text-body">
            Available:{" "}
            <span className="font-bold text-heading">
              {(wallet?.coin_balance ?? 0).toLocaleString("en-IN")} coins
            </span>
          </p>
        </div>
      </div>

      {successfulRedemption && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Reward redeemed successfully</p>

            <p className="mt-1 text-sm">
              {successfulRedemption.reward_name} was redeemed for{" "}
              {successfulRedemption.coins_spent.toLocaleString("en-IN")} coins.
            </p>
          </div>

          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => {
              setSuccessfulRedemption(null);
            }}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {catalogue?.items.map((reward) => {
          const affordable = (wallet?.coin_balance ?? 0) >= reward.coin_cost;

          const RewardIcon =
            reward.reward_type === "CASHBACK" ? BadgeIndianRupee : Ticket;

          return (
            <Card
              key={reward.id}
              className="flex min-h-64 flex-col p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-coin-50 text-coin-600">
                <RewardIcon aria-hidden="true" className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-bold text-heading">{reward.name}</h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-body">
                {reward.description}
              </p>

              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted">Reward value</p>

                  <p className="mt-1 text-sm font-semibold text-heading">
                    {formatCurrency(reward.reward_value)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted">Cost</p>

                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-coin-600">
                    <Coins aria-hidden="true" className="h-4 w-4" />

                    {reward.coin_cost.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <Button
                className="mt-5 w-full"
                variant={affordable ? "primary" : "secondary"}
                disabled={!affordable}
                onClick={() => {
                  setErrorMessage(null);
                  setSelectedReward(reward);
                }}
              >
                {affordable ? "Redeem reward" : "Not enough coins"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Modal
        open={selectedReward !== null}
        title="Confirm redemption"
        onClose={() => {
          if (!redeemMutation.isPending) {
            setSelectedReward(null);
            setErrorMessage(null);
          }
        }}
      >
        {selectedReward && (
          <div className="p-5">
            <div className="flex items-start gap-4 rounded-2xl bg-coin-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coin-100 text-coin-600">
                <Gift aria-hidden="true" className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-bold text-heading">
                  {selectedReward.name}
                </h3>

                <p className="mt-1 text-sm leading-6 text-body">
                  {selectedReward.description}
                </p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-border">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-sm text-body">Current balance</dt>

                <dd className="font-semibold text-heading">
                  {(wallet?.coin_balance ?? 0).toLocaleString("en-IN")} coins
                </dd>
              </div>

              <div className="flex justify-between gap-4 py-3">
                <dt className="text-sm text-body">Redemption cost</dt>

                <dd className="font-semibold text-red-600">
                  −{selectedReward.coin_cost.toLocaleString("en-IN")} coins
                </dd>
              </div>

              <div className="flex justify-between gap-4 py-3">
                <dt className="text-sm font-semibold text-heading">
                  Remaining balance
                </dt>

                <dd className="font-bold text-brand-700">
                  {Math.max(
                    0,
                    (wallet?.coin_balance ?? 0) - selectedReward.coin_cost,
                  ).toLocaleString("en-IN")}{" "}
                  coins
                </dd>
              </div>
            </dl>

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <XCircle aria-hidden="true" className="h-5 w-5 shrink-0" />

                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={redeemMutation.isPending}
                onClick={() => {
                  setSelectedReward(null);
                  setErrorMessage(null);
                }}
              >
                Cancel
              </Button>

              <Button
                loading={redeemMutation.isPending}
                onClick={confirmRedemption}
              >
                Confirm redemption
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
