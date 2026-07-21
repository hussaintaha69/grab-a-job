import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware client. Runs as the logged-in user, so Postgres Row Level
 * Security automatically scopes every query to that user's own rows.
 * Use this everywhere except the bookmarklet endpoint.
 */
export function getSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

/**
 * Admin client using the service_role key, which bypasses Row Level
 * Security entirely. Only used by /api/save-job, which authenticates
 * requests via a personal bookmarklet token instead of a browser session,
 * and must look up which user that token belongs to across all users.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  job_url: string | null;
  source: string;
  status: ApplicationStatus;
  notes: string | null;
  follow_up_date: string | null;
  date_applied: string | null;
  created_at: string;
  updated_at: string;
}
