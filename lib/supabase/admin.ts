import { createClient } from "@supabase/supabase-js";
import { validateServiceEnv } from "@/lib/env";

export function createSupabaseAdminClient() {
  validateServiceEnv();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
