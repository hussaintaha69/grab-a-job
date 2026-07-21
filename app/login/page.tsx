"use client";

import { getSupabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  async function signIn() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="max-w-sm mx-auto mt-24 text-center px-6">
      <h1 className="font-display text-2xl text-ink mb-2">Grab a Job</h1>
      <p className="text-sm text-muted mb-8">
        Sign in to track your applications.
      </p>
      <button
        onClick={signIn}
        className="font-mono text-sm px-4 py-2.5 border border-ink text-ink rounded-sm hover:bg-ink hover:text-paper transition-colors w-full"
      >
        Sign in with Google
      </button>
    </div>
  );
}
