"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/token")
      .then((res) => res.json())
      .then((data) => setToken(data.token ?? ""))
      .finally(() => setLoading(false));
  }, []);

  function copy() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink mb-2">Settings</h1>
      <p className="text-sm text-muted mb-6">
        This is your personal token for the browser bookmarklet. It's tied
        to your account, so jobs you grab always land in your own tracker.
        Don't share it — anyone with this token can add entries to your
        account.
      </p>

      <div className="border border-line rounded-sm p-4 bg-white">
        <span className="block text-sm font-mono text-muted mb-2">
          Your bookmarklet token
        </span>
        {loading ? (
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
