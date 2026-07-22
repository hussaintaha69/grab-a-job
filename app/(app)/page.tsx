"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Status = "saved" | "applied" | "interview" | "offer" | "rejected";
type SortKey =
  | "date_new"
  | "date_old"
  | "company_az"
  | "company_za"
  | "role_az"
  | "role_za";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_new", label: "Date (newest first)" },
  { value: "date_old", label: "Date (oldest first)" },
  { value: "company_az", label: "Company (A–Z)" },
  { value: "company_za", label: "Company (Z–A)" },
  { value: "role_az", label: "Role (A–Z)" },
  { value: "role_za", label: "Role (Z–A)" },
];

interface Application {
  id: string;
  company: string;
  role: string;
  job_url: string | null;
  source: string;
  status: Status;
  notes: string | null;
  created_at: string;
}

const STATUSES: Status[] = ["saved", "applied", "interview", "offer", "rejected"];

const STATUS_COLOR: Record<Status, string> = {
  saved: "bg-saved",
  applied: "bg-applied",
  interview: "bg-interview",
  offer: "bg-offer",
  rejected: "bg-rejected",
};

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("date_new");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const url =
      filter === "all" ? "/api/applications" : `/api/applications?status=${filter}`;

    try {
      const res = await fetch(url);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setApplications([]);
        setLoadError(
          (data && data.error) || `Request failed (status ${res.status}).`
        );
        return;
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setApplications([]);
      setLoadError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: Status) {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    load();
  }

  const counts = STATUSES.reduce<Record<Status, number>>((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  const sortedApplications = [...applications].sort((a, b) => {
    switch (sortBy) {
      case "date_new":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "date_old":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "company_az":
        return a.company.localeCompare(b.company);
      case "company_za":
        return b.company.localeCompare(a.company);
      case "role_az":
        return a.role.localeCompare(b.role);
      case "role_za":
        return b.role.localeCompare(a.role);
      default:
        return 0;
    }
  });

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Applications</h1>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-muted">
            {applications.length} total
          </span>
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh applications"
            className="text-muted hover:text-ink transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 4v5h-5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {STATUSES.map((s) => (
            <FilterChip
              key={s}
              label={`${s} (${counts[s] ?? 0})`}
              active={filter === s}
              onClick={() => setFilter(s)}
              dotClass={STATUS_COLOR[s]}
            />
          ))}
        </div>

        <label className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="font-mono text-xs border border-line rounded-sm px-2 py-1.5 bg-paper text-ink"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted">Loading…</p>
      ) : loadError ? (
        <div className="border border-rejected rounded-sm p-4 text-sm text-rejected">
          {loadError}
        </div>
      ) : applications.length === 0 ? (
        <div className="border border-line rounded-sm p-8 text-center">
          <p className="text-ink mb-1">No entries yet.</p>
          <p className="text-sm text-muted">
            Add one manually, or grab a job straight from the page using
            the browser extension or bookmarklet.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sortedApplications.map((app) => (
            <li
              key={app.id}
              className="border border-line rounded-sm p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`status-dot ${STATUS_COLOR[app.status]}`} />
                  <span className="font-mono text-xs uppercase text-muted">
                    {app.source}
                  </span>
                </div>
                <p className="text-ink font-medium">
                  {app.role} — {app.company}
                </p>
                {app.job_url && (
                  <a
                    href={app.job_url}
                    target="_blank"
                    rel="noreferrer"
                    title={app.job_url}
                    className="block truncate text-sm text-applied underline"
                  >
                    {app.job_url}
                  </a>
                )}
                {app.notes && (
                  <p className="text-sm text-muted mt-1">{app.notes}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <select
                  value={app.status}
                  onChange={(e) =>
                    updateStatus(app.id, e.target.value as Status)
                  }
                  className="font-mono text-xs border border-line rounded-sm px-2 py-1 bg-paper"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(app.id)}
                  className="text-xs text-rejected hover:underline"
                >
                  delete
                </button>
                <Link
                  href={`/applications/${app.id}/edit`}
                  className="text-xs text-applied hover:underline"
                >
                  edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  dotClass,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dotClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-3 py-1.5 rounded-sm border flex items-center gap-1.5 transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-ink hover:border-ink"
      }`}
    >
      {dotClass && <span className={`status-dot ${dotClass}`} />}
      {label}
    </button>
  );
}
