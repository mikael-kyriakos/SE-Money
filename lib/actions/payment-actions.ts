"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toPence } from "@/lib/utils";

const paymentSchema = z.object({
  cardCode: z.string().min(3),
  amount: z.coerce.number().positive().max(100000),
  pin: z.string().regex(/^\d{4}$/),
  note: z.string().trim().max(120).optional(),
});

const requestSchema = z.object({
  amount: z.union([z.literal(""), z.coerce.number().positive().max(100000)]),
  note: z.string().trim().max(120).optional(),
});

export async function executeTapPaymentAction(_prevState: unknown, formData: FormData) {
  const parsed = paymentSchema.safeParse({
    cardCode: formData.get("cardCode"),
    amount: formData.get("amount"),
    pin: formData.get("pin"),
    note: formData.get("note")?.toString(),
  });

  if (!parsed.success) {
    return { error: "Enter a valid amount and 4-digit PIN." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("execute_card_payment", {
    card_code_input: parsed.data.cardCode,
    amount_pence_input: toPence(parsed.data.amount),
    pin_input: parsed.data.pin,
    note_input: parsed.data.note?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath(`/tap/${parsed.data.cardCode}`);

  return { success: true, transactionId: data };
}

export async function savePaymentRequestAction(_prevState: unknown, formData: FormData) {
  const parsed = requestSchema.safeParse({
    amount: formData.get("amount"),
    note: formData.get("note")?.toString(),
  });

  if (!parsed.success) {
    return { error: "Use a valid amount or leave it blank." };
  }

  const supabase = await createSupabaseServerClient();
  const amountPence = parsed.data.amount === "" ? null : toPence(parsed.data.amount);
  const { error } = await supabase.rpc("upsert_payment_request", {
    amount_pence_input: amountPence,
    note_input: parsed.data.note?.trim() || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/request");
  return { success: true };
}
