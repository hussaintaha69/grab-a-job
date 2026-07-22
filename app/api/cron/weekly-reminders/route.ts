import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// Vercel Cron automatically sends "Authorization: Bearer <CRON_SECRET>"
// when it invokes this route, if you set a CRON_SECRET env var. This
// guards against anyone else triggering mass emails by hitting the URL.
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const { data: settingsRows, error: settingsError } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("reminders_enabled", true);

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const results: { user_id: string; sent: boolean; reason?: string }[] = [];

  for (const row of settingsRows ?? []) {
    const userId = row.user_id;

    const { data: jobs, error: jobsError } = await supabase
      .from("applications")
      .select("company, role, job_url, created_at")
      .eq("user_id", userId)
      .eq("status", "saved")
      .order("created_at", { ascending: true });

    if (jobsError || !jobs || jobs.length === 0) {
      results.push({ user_id: userId, sent: false, reason: "no saved jobs" });
      continue;
    }

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    const email = userData?.user?.email;
    if (userError || !email) {
      results.push({ user_id: userId, sent: false, reason: "no email on file" });
      continue;
    }

    const rowsHtml = jobs
      .map(
        (j) =>
          `<li>${escapeHtml(j.role)} — ${escapeHtml(j.company)}${
            j.job_url
              ? ` (<a href="${escapeHtml(j.job_url)}">listing</a>)`
              : ""
          }</li>`
      )
      .join("");

    const html = `
      <p>You have ${jobs.length} saved job${jobs.length === 1 ? "" : "s"} you haven't applied to yet:</p>
      <ul>${rowsHtml}</ul>
      ${appUrl ? `<p><a href="${appUrl}">Open Grab a Job</a></p>` : ""}
    `;

    try {
      await resend.emails.send({
        from: process.env.REMINDER_FROM_EMAIL ?? "onboarding@resend.dev",
        to: email,
        subject: `${jobs.length} saved job${jobs.length === 1 ? "" : "s"} still waiting on an application`,
        html,
      });
      results.push({ user_id: userId, sent: true });
    } catch (err) {
      results.push({
        user_id: userId,
        sent: false,
        reason: err instanceof Error ? err.message : "send failed",
      });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
