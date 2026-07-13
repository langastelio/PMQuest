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

-- =====================================================================
--  5) Profiles / leaderboard — public display name + score per user.
--     Works for both email accounts and anonymous ("name only") users.
-- =====================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text        not null,
  xp         integer     not null default 0,
  answered   integer     not null default 0,
  updated_at timestamptz not null default now()
);

-- Case-insensitive unique display names ("Ana" == "ana" == "ANA").
create unique index if not exists profiles_name_lower_idx on public.profiles (lower(name));

alter table public.profiles enable row level security;

-- Anyone (even signed-out visitors) can READ the leaderboard...
drop policy if exists "leaderboard read" on public.profiles;
create policy "leaderboard read"
  on public.profiles for select
  using (true);

-- ...but a user may create/update ONLY their own profile row.
drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 6) Anti-cheat guardrail: clamp XP to a sane maximum relative to how many
--    questions were answered (~40 XP/question is already generous: 20 base +
--    10 speed + perfect-round bonuses). Stops a tampered client from posting
--    an absurd score. NOTE: mitigation, not full protection — a determined
--    cheater could also inflate `answered`. Real integrity needs server-side
--    scoring of each answer.
create or replace function public.clamp_profile_xp()
returns trigger language plpgsql as $$
begin
  if new.xp < 0 then new.xp := 0; end if;
  if new.answered < 0 then new.answered := 0; end if;
  if new.xp > (new.answered * 40 + 100) then new.xp := new.answered * 40 + 100; end if;
  return new;
end $$;

drop trigger if exists profiles_clamp_xp on public.profiles;
create trigger profiles_clamp_xp
  before insert or update on public.profiles
  for each row execute function public.clamp_profile_xp();
