export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  pin_hash: string | null;
  balance_pence: number;
  created_at: string;
  updated_at: string;
};

export type NfcCard = {
  id: string;
  card_code: string;
  owner_user_id: string;
  active: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  payer_user_id: string;
  receiver_user_id: string;
  amount_pence: number;
  note: string | null;
  created_at: string;
  payer_name?: string;
  receiver_name?: string;
};

export type PaymentRequest = {
  id: string;
  owner_user_id: string;
  amount_pence: number | null;
  note: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type GroupExpense = {
  id: string;
  group_key: string;
  payer_user_id: string;
  description: string;
  total_amount_pence: number;
  split_mode: "equal" | "custom";
  created_at: string;
};

export type GroupExpenseShare = {
  id: string;
  expense_id: string;
  user_id: string;
  amount_pence: number;
};
