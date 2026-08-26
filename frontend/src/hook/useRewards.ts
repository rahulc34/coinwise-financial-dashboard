import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchRewardCatalogue,
  fetchWalletBalance,
  redeemReward,
} from "../api/rewards";
import type { Redemption, WalletBalance } from "../types/reward";

export function useWalletBalance() {
  return useQuery({
    queryKey: ["rewards", "balance"],
    queryFn: fetchWalletBalance,
  });
}

export function useRewardCatalogue() {
  return useQuery({
    queryKey: ["rewards", "catalogue"],
    queryFn: fetchRewardCatalogue,
  });
}

interface RedeemVariables {
  rewardId: string;
  coinCost: number;
}

interface RedeemContext {
  previousBalance?: WalletBalance;
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation<Redemption, Error, RedeemVariables, RedeemContext>({
    mutationFn: ({ rewardId }) => {
      return redeemReward(rewardId);
    },

    onMutate: async ({ coinCost }) => {
      await queryClient.cancelQueries({
        queryKey: ["rewards", "balance"],
      });

      const previousBalance = queryClient.getQueryData<WalletBalance>([
        "rewards",
        "balance",
      ]);

      if (previousBalance) {
        queryClient.setQueryData<WalletBalance>(["rewards", "balance"], {
          ...previousBalance,
          coin_balance: previousBalance.coin_balance - coinCost,
        });
      }

      return {
        previousBalance,
      };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(
          ["rewards", "balance"],
          context.previousBalance,
        );
      }
    },

    onSuccess: (redemption) => {
      queryClient.setQueryData<WalletBalance>(
        ["rewards", "balance"],
        (current) => ({
          coin_balance: redemption.remaining_balance,
          updated_at: current?.updated_at ?? redemption.redeemed_at,
        }),
      );
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ["rewards", "balance"],
      });
    },
  });
}
