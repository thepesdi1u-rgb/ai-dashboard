import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Validates if a key is a real JWT (not a placeholder)
function validKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("your_") || key === "placeholder" || !key.startsWith("eyJ")) return undefined;
  return key;
}

export function createAdminClient() {
  const serviceKey = validKey(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
