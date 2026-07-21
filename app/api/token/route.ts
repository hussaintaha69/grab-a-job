import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Only chrome-extension:// origins get a reflected CORS header here — the
// website itself calls this same-origin and doesn't need one. Credentialed
// requests can't use a wildcard origin, so we echo back the exact origin.
function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  if (origin.startsWith("chrome-extension://")) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
    };
  }
  return {};
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: { ...corsHeaders(req), "Access-Control-Allow-Methods": "GET, OPTIONS" },
  });
}

export async function GET(req: NextRequest) {
  const headers = corsHeaders(req);
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401, headers });
  }

  const { data: existing } = await supabase
    .from("api_tokens")
    .select("token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return NextResponse.json({ token: existing.token }, { headers });

  const { data: created, error } = await supabase
    .from("api_tokens")
    .insert({ user_id: user.id })
    .select("token")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
  return NextResponse.json({ token: created.token }, { headers });
}
