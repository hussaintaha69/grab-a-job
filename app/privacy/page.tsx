export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 font-sans text-ink bg-paper min-h-screen">
      <h1 className="font-display text-2xl mb-6">Privacy Policy — Grab a Job</h1>

      <p className="text-sm text-muted mb-6">Last updated: {new Date().getFullYear()}</p>

      <section className="mb-6">
        <h2 className="font-display text-lg mb-2">What this app is</h2>
        <p className="text-sm leading-relaxed">
          Grab a Job is a personal job-application tracker with an optional
          Chrome extension and browser bookmarklet for saving job listings
          from other sites into your tracker. This page describes what data
          the web app, extension, and bookmarklet collect and how it's used.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-lg mb-2">What data is collected</h2>
        <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
          <li>
            Your name and email address, from Google sign-in (we don't set a
            separate password).
          </li>
          <li>
            The job application entries you create or save — company, role,
            job URL, status, notes, and dates.
          </li>
          <li>
            A personal access token, used only to let the browser extension
            or bookmarklet identify your account when saving a job.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-lg mb-2">
          What the browser extension reads
        </h2>
        <p className="text-sm leading-relaxed">
          The extension only reads the current page's content when you
          actively click "Grab this job" — it does not run in the background
          or monitor your browsing otherwise. From that page, it extracts
          only a job title, company name, and URL, and sends just that
          extracted information (not the whole page) to this app's server.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-lg mb-2">How data is stored and shared</h2>
        <p className="text-sm leading-relaxed">
          Application data is stored in a Supabase (PostgreSQL) database and
          is only ever accessible to your own account, enforced at the
          database level. We do not sell, rent, or share your data with
          third parties for advertising or marketing. Data is shared only
          with the infrastructure providers necessary to run the app
          (Supabase for the database and authentication, Google for
          sign-in, Vercel for hosting).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-lg mb-2">Data deletion</h2>
        <p className="text-sm leading-relaxed">
          You can delete individual application entries at any time from
          the dashboard. To delete your account entirely, contact the app
          owner.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg mb-2">Contact</h2>
        <p className="text-sm leading-relaxed">
          Questions about this policy or your data can be sent to the
          app owner's contact email.
        </p>
      </section>
    </div>
  );
}
