-- =====================================================================
--  PM Quest — Supabase schema
--  Run this ONCE in the Supabase Dashboard → SQL Editor → "New query".
--  Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE where possible).
-- =====================================================================

-- 1) One row per user, holding the whole game `state` object as JSON.
--    This mirrors exactly what the app already stores in localStorage.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- 2) Row Level Security: without policies, NO ONE can read/write the table.
alter table public.progress enable row level security;

-- 3) Policies — a signed-in user may touch ONLY their own row.
drop policy if exists "read own progress"   on public.progress;
drop policy if exists "insert own progress" on public.progress;
drop policy if exists "update own progress" on public.progress;

create policy "read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4) Keep updated_at current on every write (used for last-write-wins sync).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists progress_touch_updated_at on public.progress;
create trigger progress_touch_updated_at
  before update on public.progress
  for each row execute function public.touch_updated_at();
