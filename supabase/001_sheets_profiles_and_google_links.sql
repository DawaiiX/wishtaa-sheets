-- Wishtaa Sheets: P2-1 tables. Run once in Supabase -> SQL Editor.
-- No tokens, no workflows. Every table is owner-only (RLS).

-- 1) Profiles: identity, display name, preferences.
create table if not exists public.sheets_profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  preferences  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.sheets_profiles enable row level security;
revoke all on public.sheets_profiles from anon;

create policy sheets_profiles_select_own on public.sheets_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy sheets_profiles_insert_own on public.sheets_profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy sheets_profiles_update_own on public.sheets_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 2) Which Google address is linked for Drive, and its status (used from P2-2).
create table if not exists public.sheets_google_links (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  google_email    text not null check (char_length(google_email) <= 320),
  status          text not null check (status in ('linked', 'needs_reconnect', 'mismatch')),
  linked_at       timestamptz not null default now(),
  last_checked_at timestamptz not null default now()
);

alter table public.sheets_google_links enable row level security;
revoke all on public.sheets_google_links from anon;

create policy sheets_google_links_select_own on public.sheets_google_links
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy sheets_google_links_insert_own on public.sheets_google_links
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy sheets_google_links_update_own on public.sheets_google_links
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- No delete policies: rows disappear only when the user account is deleted.
-- Run this script only once: running it again fails on the policy names.
