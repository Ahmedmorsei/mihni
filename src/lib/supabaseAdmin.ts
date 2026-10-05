import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only: never import this file from a "use client" component or
// expose SUPABASE_SERVICE_ROLE_KEY to the browser. This client bypasses
// Row Level Security, so it's used only for trusted server routes such as
// account deletion.
//
// Created lazily (on first use) so a missing service role key does not
// crash build-time route analysis.
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to use the Supabase admin client."
    );
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
