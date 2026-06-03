-- Sudoku Dojo — leaderboard table. Run this once in the Supabase SQL editor.
-- Stores one public row per user (nick + rating + stats). Anyone can read;
-- only the authenticated user can write their own row.

create table if not exists public.leaderboard_entries (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nick       text        not null default 'Deshi',
  rating     integer     not null default 400,
  solved     integer     not null default 0,
  streak     integer     not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.leaderboard_entries enable row level security;

-- Public read — leaderboard is meant to be visible.
drop policy if exists "leaderboard public read" on public.leaderboard_entries;
create policy "leaderboard public read" on public.leaderboard_entries
  for select using (true);

-- Each user controls only their own row.
drop policy if exists "leaderboard own insert" on public.leaderboard_entries;
create policy "leaderboard own insert" on public.leaderboard_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "leaderboard own update" on public.leaderboard_entries;
create policy "leaderboard own update" on public.leaderboard_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
