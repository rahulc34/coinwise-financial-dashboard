export interface WalletBalance {
  coin_balance: number;
  updated_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  coin_cost: number;
  reward_type: string;
  reward_value: string;
  is_active: boolean;
}

export interface RewardCatalogue {
  items: Reward[];
}

export interface Redemption {
  redemption_id: string;
  reward_id: string;
  reward_name: string;
  coins_spent: number;
  remaining_balance: number;
  status: string;
  redeemed_at: string;
}
