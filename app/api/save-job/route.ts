import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-bookmarklet-token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-bookmarklet-token");
  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 401, headers: corsHeaders }
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: tokenRow, error: tokenError } = await supabase
    .from("api_tokens")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401, headers: corsHeaders }
    );
  }

  const body = await req.json();
  if (!body.company || !body.role) {
    return NextResponse.json(
      { error: "company and role are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: tokenRow.user_id,
      company: body.company,
      role: body.role,
      job_url: body.job_url ?? null,
      source: body.source ?? "other",
      status: "saved",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json(data, { status: 201, headers: corsHeaders });
}
