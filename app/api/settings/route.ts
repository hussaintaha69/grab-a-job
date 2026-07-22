import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("user_settings")
    .select("reminders_enabled")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return NextResponse.json(existing);

  const { data: created, error } = await supabase
    .from("user_settings")
    .insert({ user_id: user.id })
    .select("reminders_enabled")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();

  // Upsert, since a settings row might not exist yet for this user.
  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        reminders_enabled: !!body.reminders_enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("reminders_enabled")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
