-- Sudoku Dojo — backend schema. Run this once in the Supabase SQL editor.
-- Stores each authenticated user's profile (ratings, streaks, stats, history)
-- as JSON, owned and editable only by that user via Row Level Security.

create table if not exists public.dojo_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dojo_profiles enable row level security;

-- Each user may read their own row.
drop policy if exists "read own profile" on public.dojo_profiles;
create policy "read own profile" on public.dojo_profiles
  for select using (auth.uid() = id);

-- Each user may insert their own row.
drop policy if exists "insert own profile" on public.dojo_profiles;
create policy "insert own profile" on public.dojo_profiles
  for insert with check (auth.uid() = id);

-- Each user may update their own row.
drop policy if exists "update own profile" on public.dojo_profiles;
create policy "update own profile" on public.dojo_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
