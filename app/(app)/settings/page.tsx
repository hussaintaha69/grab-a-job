"use client";

import { useEffect, useState } from "react";
import BackHome from "@/components/BackHome";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [tokenLoading, setTokenLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [remindersSaving, setRemindersSaving] = useState(false);

  useEffect(() => {
    fetch("/api/token")
      .then((res) => res.json())
      .then((data) => setToken(data.token ?? ""))
      .finally(() => setTokenLoading(false));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setRemindersEnabled(!!data.reminders_enabled))
      .finally(() => setRemindersLoading(false));
  }, []);

  function copy() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function toggleReminders() {
    const next = !remindersEnabled;
    setRemindersSaving(true);
    setRemindersEnabled(next); // optimistic

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminders_enabled: next }),
    });

    if (!res.ok) {
      setRemindersEnabled(!next); // revert on failure
    }
    setRemindersSaving(false);
  }

  return (
    <div className="max-w-lg">
      <BackHome />
      <h1 className="font-display text-2xl text-ink mb-6">Settings</h1>

      <div className="border border-line rounded-sm p-4 bg-white mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="block text-sm font-medium text-ink mb-1">
              Weekly reminder emails
            </span>
            <span className="block text-xs text-muted">
              A once-a-week email listing jobs you've saved but haven't
              applied to yet.
            </span>
          </div>
          <button
            role="switch"
            aria-checked={remindersEnabled}
            onClick={toggleReminders}
            disabled={remindersLoading || remindersSaving}
            className={`shrink-0 w-11 h-6 rounded-full transition-colors relative disabled:opacity-50 ${
              remindersEnabled ? "bg-offer" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                remindersEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted mb-6">
        This is your personal token for the browser extension. 
        It's tied to your account, so jobs you grab always land
        in your own tracker. Don't share it — anyone with this token can
        add entries to your account.
      </p>

      <div className="border border-line rounded-sm p-4 bg-white">
        <span className="block text-sm font-mono text-muted mb-2">
          Your personal token
        </span>
        {tokenLoading ? (
          <p className="font-mono text-sm text-muted">Loading…</p>
        ) : (
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs text-ink break-all flex-1">
              {token}
            </code>
            <button
              onClick={copy}
              className="font-mono text-xs px-3 py-1.5 border border-ink text-ink rounded-sm hover:bg-ink hover:text-paper transition-colors shrink-0"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
