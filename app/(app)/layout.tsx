import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import MotivationalBanner from "@/components/MotivationalBanner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b border-line">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-xl text-ink">
            Grab a Job
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/settings"
              className="font-mono text-xs text-muted hover:text-ink transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/applications/new"
              className="text-sm font-mono px-3 py-1.5 border border-ink text-ink rounded-sm hover:bg-ink hover:text-paper transition-colors"
            >
              + New entry
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <MotivationalBanner />
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
