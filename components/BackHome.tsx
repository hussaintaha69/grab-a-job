import Link from "next/link";

export default function BackHome() {
  return (
    <Link
      href="/"
      className="inline-block font-mono text-xs text-muted hover:text-ink transition-colors mb-6"
    >
      ← Back to dashboard
    </Link>
  );
}
