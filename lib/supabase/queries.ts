import { cache } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NfcCard, PaymentRequest, Profile, Transaction } from "@/lib/types";

export const getCurrentProfile = cache(async () => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (error || !data) {
    throw new Error("Unable to load profile");
  }

  return data as Profile;
});

export const requireCompletedProfile = cache(async () => {
  const profile = await getCurrentProfile();

  if (!profile.display_name || !profile.pin_hash) {
    redirect("/onboarding");
  }

  return profile;
});

export async function getCurrentCard() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("nfc_cards")
    .select("*")
    .eq("owner_user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return data as NfcCard | null;
}

export async function getCurrentPaymentRequest() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("payment_requests")
    .select("*")
    .eq("owner_user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  return data as PaymentRequest | null;
}

export async function getPaymentRequestForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("get_active_payment_request_for_user", {
    target_user_id: userId,
  });

  return ((data as PaymentRequest[] | null)?.[0] ?? null) as PaymentRequest | null;
}

export async function getRecentTransactions(limit = 10) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_my_transactions", {
    limit_count: limit,
    target_user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Transaction[];
}

export async function getTapContext(cardCode: string) {
  const user = await requireUser(`/tap/${cardCode}`);
  const supabase = await createSupabaseServerClient();

  const [{ data: payerCards, error: cardError }, { data: receiverProfile, error: profileError }] = await Promise.all([
    supabase.rpc("get_tap_card_context", {
      card_code_input: cardCode,
    }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  if (cardError) {
    throw new Error(cardError.message);
  }

  if (profileError || !receiverProfile) {
    throw new Error("Unable to load receiver profile");
  }

  const payerCard = ((payerCards as Array<{
    card_code: string;
    owner_user_id: string;
    payer_display_name: string | null;
    payer_email: string;
  }> | null) ?? [])[0];

  if (!payerCard) {
    return {
      notFound: true as const,
      receiver: receiverProfile as Profile,
    };
  }

  return {
    notFound: false as const,
    receiver: receiverProfile as Profile,
    payer: {
      id: payerCard.owner_user_id,
      cardCode: payerCard.card_code,
      displayName: payerCard.payer_display_name ?? "Unknown payer",
      email: payerCard.payer_email ?? "",
    },
  };
}
