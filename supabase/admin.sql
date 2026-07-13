-- =====================================================================
--  PM Quest — ADMIN & CLEANUP (advanced / destructive)
--  Run in Supabase SQL Editor AFTER schema.sql.
--
--  Why this is separate from schema.sql:
--   - These functions DELETE users and RESET everyone's XP.
--   - They run with elevated privileges (SECURITY DEFINER) so they can
--     bypass Row Level Security — but each one first checks that the
--     caller is an admin. This is the ONLY safe way to give an admin
--     button to a browser app: the power lives in the database, never
--     in the client (the browser only holds the public key).
-- =====================================================================

-- 1) Admin flag on profiles.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2) Helper: is the CURRENT user an admin?  (bypasses RLS via definer)
create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 3) ADMIN: reset every player's XP to zero and wipe saved game state.
create or replace function public.admin_reset_all_xp()
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.profiles set xp = 0, answered = 0;
  delete from public.progress;   -- everyone starts fresh
end $$;

-- 4) ADMIN: delete a user entirely (cascades to profiles + progress).
create or replace function public.admin_delete_user(target uuid)
returns void
language plpgsql security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if target = auth.uid() then raise exception 'cannot delete yourself'; end if;
  delete from auth.users where id = target;
end $$;

-- 4b) ADMIN: reset ONE user's XP/score and wipe their saved state.
create or replace function public.admin_reset_user_xp(target uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  update public.profiles set xp = 0, answered = 0 where id = target;
  delete from public.progress where user_id = target;
end $$;

-- 5) Permissions: signed-in users may CALL these, but the body still
--    enforces the admin check, so non-admins just get "not authorized".
grant execute on function public.is_admin()               to anon, authenticated;
grant execute on function public.admin_reset_all_xp()     to authenticated;
grant execute on function public.admin_delete_user(uuid)  to authenticated;
grant execute on function public.admin_reset_user_xp(uuid) to authenticated;

-- =====================================================================
--  6) AUTO-CLEANUP — delete accounts that still have 0 XP after 2 days.
--     (profiles.updated_at changes on every score update, so "xp = 0 and
--      not touched in 2 days" ≈ "created and never really played".)
-- =====================================================================
create or replace function public.cleanup_inactive_users()
returns integer
language plpgsql security definer
set search_path = public, auth
as $$
declare deleted_count integer;
begin
  with doomed as (
    select id from public.profiles
    where xp = 0 and updated_at < now() - interval '2 days'
  ),
  del as (
    delete from auth.users where id in (select id from doomed) returning 1
  )
  select count(*) into deleted_count from del;
  return deleted_count;
end $$;

-- 7) Schedule it daily at 03:00 with pg_cron.
--    First enable the extension: Dashboard → Database → Extensions → pg_cron.
create extension if not exists pg_cron;
select cron.schedule(
  'pmquest-cleanup-inactive',
  '0 3 * * *',
  $$ select public.cleanup_inactive_users(); $$
);
-- To remove the schedule later:  select cron.unschedule('pmquest-cleanup-inactive');

-- =====================================================================
--  8) MAKE YOURSELF ADMIN — run ONCE, after you have logged in at least
--     once (so your profile row exists). Replace the name with yours:
-- =====================================================================
-- update public.profiles set is_admin = true where lower(name) = lower('O_TEU_NOME');
