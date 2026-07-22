-- Run this in the Supabase SQL editor for your project.
-- If you're upgrading from the single-user version, drop the old
-- `applications` table first (it has no user_id column and this app
-- is starting fresh per your setup).

create extension if not exists "pgcrypto";

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  job_url text,
  source text not null default 'manual',        -- 'linkedin' | 'naukri' | 'manual' | 'other'
  status text not null default 'saved',          -- 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  notes text,
  follow_up_date date,
  date_applied timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on applications (user_id);
create index if not exists applications_status_idx on applications (status);
create index if not exists applications_created_at_idx on applications (created_at desc);

alter table applications enable row level security;

create policy "select own applications"
  on applications for select
  using (auth.uid() = user_id);

create policy "insert own applications"
  on applications for insert
  with check (auth.uid() = user_id);

create policy "update own applications"
  on applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own applications"
  on applications for delete
  using (auth.uid() = user_id);

-- One personal token per user, used by the browser bookmarklet and the
-- Chrome extension (neither can rely on a normal session cookie: the
-- bookmarklet runs on linkedin.com/naukri.com, and the extension's
-- automatic session detection isn't guaranteed to work in every browser).
create table if not exists api_tokens (
  token text primary key default encode(gen_random_bytes(24), 'hex'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table api_tokens enable row level security;

create policy "select own token"
  on api_tokens for select
  using (auth.uid() = user_id);

create policy "insert own token"
  on api_tokens for insert
  with check (auth.uid() = user_id);

-- Note: /api/save-job reads api_tokens using the service_role key
-- (which bypasses RLS on purpose), since it has to look up which user
-- a given token belongs to before it knows whose row to insert.

-- One settings row per user. Currently just the weekly reminder email
-- toggle, but a natural place to add more personal preferences later.
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reminders_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "select own settings"
  on user_settings for select
  using (auth.uid() = user_id);

create policy "insert own settings"
  on user_settings for insert
  with check (auth.uid() = user_id);

create policy "update own settings"
  on user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Note: the weekly reminder cron job reads this table using the
-- service_role key, bypassing RLS on purpose — it has to look across
-- every user with reminders enabled, not just one.
