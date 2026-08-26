import { useQuery } from "@tanstack/react-query";

import { fetchRewardCatalogue, fetchWalletBalance } from "../api/rewards";

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
