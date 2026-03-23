"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  displayName: z.string().min(2).max(40),
  pin: z.string().regex(/^\d{4}$/),
});

export async function completeOnboardingAction(_prevState: unknown, formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName")?.toString().trim(),
    pin: formData.get("pin")?.toString().trim(),
  });

  if (!parsed.success) {
    return { error: "Enter a display name and a 4-digit PIN." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("complete_onboarding", {
    display_name_input: parsed.data.displayName,
    pin_input: parsed.data.pin,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
