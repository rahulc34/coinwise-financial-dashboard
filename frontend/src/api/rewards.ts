import { apiRequest } from "./client";
import type {
  Redemption,
  RewardCatalogue,
  WalletBalance,
} from "../types/reward";

export function fetchWalletBalance() {
  return apiRequest<WalletBalance>("/rewards/balance");
}

export function fetchRewardCatalogue() {
  return apiRequest<RewardCatalogue>("/rewards/catalogue");
}

export function redeemReward(rewardId: string) {
  return apiRequest<Redemption>("/rewards/redeem", {
    method: "POST",
    body: JSON.stringify({
      reward_id: rewardId,
    }),
  });
}
