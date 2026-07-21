"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditApplication() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState({
    company: "",
    role: "",
    job_url: "",
    source: "manual",
    status: "saved",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/applications/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load this entry.");
        return res.json();
      })
      .then((data) => {
        setForm({
          company: data.company ?? "",
          role: data.role ?? "",
          job_url: data.job_url ?? "",
          source: data.source ?? "manual",
          status: data.status ?? "saved",
          notes: data.notes ?? "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/applications/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/");
  }

  if (loading) {
    return <p className="font-mono text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-ink mb-6">Edit entry</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Company">
          <input
            required
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper"
          />
        </Field>

        <Field label="Role">
          <input
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper"
          />
        </Field>

        <Field label="Job URL">
          <input
            type="url"
            value={form.job_url}
            onChange={(e) => setForm({ ...form, job_url: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper"
            placeholder="https://…"
          />
        </Field>

        <Field label="Source">
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper"
          >
            <option value="manual">Manual</option>
            <option value="linkedin">LinkedIn</option>
            <option value="naukri">Naukri</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper"
          >
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-line rounded-sm px-3 py-2 bg-paper"
            rows={3}
          />
        </Field>

        {error && <p className="text-sm text-rejected">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="font-mono text-sm px-4 py-2 border border-ink text-ink rounded-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="font-mono text-sm px-4 py-2 text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-mono text-muted mb-1">{label}</span>
      {children}
    </label>
  );
}
