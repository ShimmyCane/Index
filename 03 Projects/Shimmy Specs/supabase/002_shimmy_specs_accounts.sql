-- Shimmy Specs — schema v1: accounts, sessions, cloud projects, templates, lessons.
-- Target: the Architecture Supabase project. Supersedes 001. If 001 was run, this file upgrades its
-- ss_projects table in place. The file is safe to run again.
--
-- Design
-- - One allowed account for now. Only usernames in ss_allowed_users can sign in.
--   The first sign-in sets the password (it may be blank). There is no reset feature.
-- - Username + password, managed here (not Supabase Auth). Passwords are bcrypt hashes.
-- - Five wrong passwords lock the account for 15 minutes.
-- - Tables have RLS on and NO policies, so anon and authenticated cannot read or write
--   them directly. The app calls only the ss_* functions below (security definer,
--   fixed search_path, no SQL built from text).
-- - Sessions: a random token is returned once; only its SHA-256 hash is stored. 30 days.
--
-- Run this whole file once in the SQL editor of the Architecture project.
-- Then add the allowed sign-in by hand (NOT in this file, because the repo is public):
--   insert into public.ss_allowed_users (username_key) values (lower('<your sign-in email>'));

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tables

create table if not exists public.ss_allowed_users (
  username_key text primary key check (username_key = lower(username_key)),
  added_at timestamptz not null default now()
);

create table if not exists public.ss_users (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(username) between 3 and 64),
  username_key text generated always as (lower(username)) stored,
  password_hash text not null,
  failed_count integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  constraint ss_users_username_key_unique unique (username_key)
);

create table if not exists public.ss_sessions (
  token_hash text primary key,
  user_id uuid not null references public.ss_users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.ss_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ss_users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  kind text not null check (kind in ('sketch', 'own')),
  state jsonb not null check (pg_column_size(state) < 4000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Upgrade path. If the first draft (001) was run, ss_projects already exists without user_id.
-- Its rows are none, so these changes are safe. If rows ever exist, the NOT NULL step stops with an error.
alter table public.ss_projects add column if not exists user_id uuid references public.ss_users (id) on delete cascade;
alter table public.ss_projects add column if not exists created_at timestamptz not null default now();
alter table public.ss_projects alter column user_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ss_projects_state_size') then
    alter table public.ss_projects add constraint ss_projects_state_size check (pg_column_size(state) < 4000000);
  end if;
end
$$;

create index if not exists ss_projects_user_updated_idx on public.ss_projects (user_id, updated_at desc);

create table if not exists public.ss_templates (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  title text not null,
  version integer not null default 1,
  body jsonb not null,
  created_at timestamptz not null default now(),
  unique (number, version)
);

create table if not exists public.ss_lessons (
  id uuid primary key default gen_random_uuid(),
  section text,
  question text,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- lock down tables

alter table public.ss_allowed_users enable row level security;
alter table public.ss_users enable row level security;
alter table public.ss_sessions enable row level security;
alter table public.ss_projects enable row level security;
-- Drop the open policies from the first draft (001). They gave any signed-in role full access.
drop policy if exists "ss_templates signed-in" on public.ss_templates;
drop policy if exists "ss_lessons signed-in" on public.ss_lessons;
drop policy if exists "ss_projects signed-in" on public.ss_projects;

alter table public.ss_templates enable row level security;
alter table public.ss_lessons enable row level security;

revoke all on public.ss_allowed_users, public.ss_users, public.ss_sessions, public.ss_projects,
  public.ss_templates, public.ss_lessons from anon, authenticated;

-- ---------------------------------------------------------------- helpers

-- Returns the user for a session token, or raises. Not callable from the browser.
create or replace function public.ss_user_from_token(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if p_token is null or char_length(p_token) <> 64 or p_token !~ '^[0-9a-f]+$' then
    raise exception 'not signed in';
  end if;
  select s.user_id into v_user
  from public.ss_sessions s
  where s.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and s.expires_at > now();
  if v_user is null then
    raise exception 'session expired, sign in again';
  end if;
  return v_user;
end;
$$;

-- ---------------------------------------------------------------- public functions (called by the app)

-- Signs in. Returns { ok: true, token, username } or { ok: false, error }.
-- Wrong passwords return (not raise) so the failure count is kept.
create or replace function public.ss_sign_in(p_username text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_username, ''));
  v_pass text := coalesce(p_password, '');
  v_user public.ss_users;
  v_token text;
begin
  if v_name !~ '^[A-Za-z0-9@._+ -]{3,64}$' then
    raise exception 'username must be 3 to 64 letters, numbers, or . _ + - @ or spaces';
  end if;
  if char_length(v_pass) > 200 then
    raise exception 'password is too long';
  end if;
  if not exists (select 1 from public.ss_allowed_users a where a.username_key = lower(v_name)) then
    raise exception 'this username is not allowed to sign in';
  end if;

  select * into v_user from public.ss_users u where u.username_key = lower(v_name) for update;
  if not found then
    insert into public.ss_users (username, password_hash)
    values (v_name, extensions.crypt(v_pass, extensions.gen_salt('bf')))
    returning * into v_user;
  else
    if v_user.locked_until is not null and v_user.locked_until > now() then
      return jsonb_build_object('ok', false, 'error', 'too many wrong passwords: wait 15 minutes and try again');
    end if;
    if v_user.password_hash is distinct from extensions.crypt(v_pass, v_user.password_hash) then
      update public.ss_users
      set failed_count = failed_count + 1,
          locked_until = case when failed_count + 1 >= 5 then now() + interval '15 minutes' else null end
      where id = v_user.id;
      return jsonb_build_object('ok', false, 'error', 'wrong password');
    end if;
    update public.ss_users set failed_count = 0, locked_until = null where id = v_user.id;
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.ss_sessions (token_hash, user_id, expires_at)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), v_user.id, now() + interval '30 days');
  delete from public.ss_sessions where expires_at < now();

  return jsonb_build_object('ok', true, 'token', v_token, 'username', v_user.username);
end;
$$;

-- Ends the session. An unknown token does nothing.
create or replace function public.ss_sign_out(p_token text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.ss_sessions
  where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

create or replace function public.ss_list_projects(p_token text)
returns table (id uuid, name text, kind text, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.kind, p.updated_at
  from public.ss_projects p
  where p.user_id = public.ss_user_from_token(p_token)
  order by p.updated_at desc
  limit 100;
$$;

-- Creates (p_id null) or updates (p_id set) one of the signed-in user's projects.
create or replace function public.ss_save_project(
  p_token text, p_id uuid, p_name text, p_kind text, p_state jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := public.ss_user_from_token(p_token);
  v_id uuid;
begin
  if p_id is null then
    insert into public.ss_projects (user_id, name, kind, state)
    values (v_user, p_name, p_kind, p_state)
    returning id into v_id;
  else
    update public.ss_projects
    set name = p_name, kind = p_kind, state = p_state, updated_at = now()
    where id = p_id and user_id = v_user
    returning id into v_id;
    if v_id is null then
      raise exception 'project not found';
    end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.ss_load_project(p_token text, p_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select p.state
  from public.ss_projects p
  where p.id = p_id and p.user_id = public.ss_user_from_token(p_token);
$$;

create or replace function public.ss_delete_project(p_token text, p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.ss_projects
  where id = p_id and user_id = public.ss_user_from_token(p_token);
$$;

-- ---------------------------------------------------------------- grants

revoke all on function public.ss_user_from_token(text) from public, anon, authenticated;

revoke all on function public.ss_sign_in(text, text) from public;
revoke all on function public.ss_sign_out(text) from public;
revoke all on function public.ss_list_projects(text) from public;
revoke all on function public.ss_save_project(text, uuid, text, text, jsonb) from public;
revoke all on function public.ss_load_project(text, uuid) from public;
revoke all on function public.ss_delete_project(text, uuid) from public;

grant execute on function public.ss_sign_in(text, text) to anon, authenticated;
grant execute on function public.ss_sign_out(text) to anon, authenticated;
grant execute on function public.ss_list_projects(text) to anon, authenticated;
grant execute on function public.ss_save_project(text, uuid, text, text, jsonb) to anon, authenticated;
grant execute on function public.ss_load_project(text, uuid) to anon, authenticated;
grant execute on function public.ss_delete_project(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------- registry

insert into public.table_index (table_name, project, purpose)
select v.t, v.p, v.u
from (values
  ('ss_allowed_users', 'Shimmy Specs', 'Usernames allowed to sign in. Added by hand. No direct access'),
  ('ss_users', 'Shimmy Specs', 'Accounts: username, password hash, lockout. No direct access; use the ss_ functions'),
  ('ss_sessions', 'Shimmy Specs', 'Session token hashes with expiry. No direct access'),
  ('ss_projects', 'Shimmy Specs', 'Cloud projects per account (state as JSON). No direct access'),
  ('ss_templates', 'Shimmy Specs', 'Section templates (versioned JSON), shared library. Not yet used by the app'),
  ('ss_lessons', 'Shimmy Specs', 'Lessons tied to a section or question; no project details. Not yet used by the app')
) as v(t, p, u)
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;
