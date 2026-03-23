import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(redirectTo?: string) {
  const user = await getSessionUser();

  if (!user) {
    const destination = redirectTo ? `/login?next=${encodeURIComponent(redirectTo)}` : "/login";
    redirect(destination);
  }

  return user;
}
