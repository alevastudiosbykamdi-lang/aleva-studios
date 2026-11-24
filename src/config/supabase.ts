import { createClient } from "@supabase/supabase-js";
import type { AppConfig } from "./env.js";

/** Server-only Supabase client. Keep this module out of browser-facing bundles. */
export function createSupabaseClient(config: Pick<AppConfig, "supabaseUrl" | "supabaseServiceRoleKey">) {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export async function checkSupabaseReadiness(
  config: Pick<AppConfig, "supabaseUrl" | "supabaseServiceRoleKey">,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetcher(`${config.supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: { apikey: config.supabaseServiceRoleKey },
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
