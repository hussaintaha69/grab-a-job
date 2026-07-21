# Grab a Job

A low-maintenance, multi-user job application tracker with Google sign-in,
plus a browser bookmarklet to save listings from LinkedIn/Naukri with one
click.

Stack: Next.js (App Router) + Supabase (Postgres + Auth) + Vercel.

---

## 1. Prerequisites

- Node.js 18+ installed locally
- A free [GitHub](https://github.com) account
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account
- A [Google Cloud](https://console.cloud.google.com) account (free — you're
  only creating OAuth credentials, not paying for anything)

---

## 2. Create your database (Supabase)

1. Go to supabase.com → **New project**. Wait ~2 minutes for it to provision.
2. Go to **SQL Editor**, paste in the entire contents of
   `supabase/schema.sql`, and run it. This creates the `applications` and
   `api_tokens` tables with Row Level Security enabled, so every user can
   only ever see their own rows — enforced by the database, not app code.
3. Go to **Project Settings → API** and note down:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon public key**
   - **service_role key** (keep this one secret — never expose it to the
     browser or commit it)

---

## 3. Set up Google sign-in

This has two halves: a Google Cloud OAuth client, and telling Supabase
about it.

### In Google Cloud Console

1. Go to console.cloud.google.com → create a new project (or use an
   existing one).
2. Go to **APIs & Services → OAuth consent screen**. Choose **External**,
   fill in an app name and your email, save.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth
   client ID**. Choose **Web application**.
4. Under **Authorized redirect URIs**, add:
   ```
   https://xxxx.supabase.co/auth/v1/callback
   ```
   (use your actual Supabase project URL)
5. Save. Copy the generated **Client ID** and **Client Secret**.

### In Supabase

1. Go to **Authentication → Providers → Google**.
2. Toggle it on, paste in the Client ID and Client Secret from above.
3. Save.
4. Go to **Authentication → URL Configuration → Redirect URLs** and add:
   ```
   http://localhost:3000/auth/callback
   https://your-deployed-domain.vercel.app/auth/callback
   ```
   This is the step that's actually required for local + deployed sign-in
   to both work — Google itself only ever redirects back to Supabase's own
   callback URL (the one you registered in the Google Cloud step above);
   Supabase then internally redirects to whichever of *these* URLs your
   app requested via `redirectTo`. If a URL isn't on this list, Supabase
   will refuse to redirect to it, even though your Google OAuth client is
   configured correctly.

That's it — Supabase handles the rest of the OAuth flow.

---

## 4. Run it locally

```bash
cd job-tracker
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with the values from step 2:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login` and can
sign in with Google. Each Google account that signs in gets its own
private set of applications.

(If sign-in fails locally, double check `http://localhost:3000/auth/callback`
is in Supabase's Redirect URLs list from step 3 above — that's the one
that actually needs it, not Google Cloud Console.)

---

## 5. Deploy (Vercel)

1. Push this project to a GitHub repo.
2. On vercel.com → **Add New → Project** → import the repo.
3. Add the same four environment variables from `.env.local`.
4. Deploy. You'll get a live URL like `https://grab-a-job-yourname.vercel.app`.
5. Add `https://grab-a-job-yourname.vercel.app/auth/callback` to Supabase's
   **Redirect URLs** list (Authentication → URL Configuration) — same
   place as the localhost one from step 3, not Google Cloud Console.

---

## 6. Set up job-grabbing

Two options, both save into your account via the same personal token:

- **Chrome extension (recommended)** — works on any page, tries to detect
  your website login automatically. See `extension/README.md`.
- **Bookmarklet** — works in any browser, no extension install needed.
  See `bookmarklet/README.md`.

Either way, grab your personal token first from the **Settings** page
after signing in.

---

## What you get

- Google sign-in, with each user's applications kept private via Postgres
  Row Level Security
- A dashboard listing every application, filterable by status and
  sortable by date, company, or role
- A form to add entries manually
- A Chrome extension to grab a job from any page, plus a bookmarklet as
  a no-install alternative
- A Settings page for retrieving your personal token
- A small rotating line of encouragement while you're in the thick of it

## Deliberately left out (add later if you want)

- Other sign-in methods (email/password, magic link) — Google-only was a
  deliberate choice to keep this simple; Supabase supports adding more
  providers later without a schema change
- An automatic "browse suggested openings" feed — see the earlier
  discussion on job aggregator APIs (Adzuna, JSearch, TheirStack) if you
  want this later
- Reminder notifications — `follow_up_date` is already in the schema,
  ready for a reminder view or scheduled job
