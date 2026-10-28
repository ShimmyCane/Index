-- Shimmy Specs — schema v1: accounts, sessions, cloud projects, templates, lessons.
-- Target: the Architecture Supabase project (<project-ref>). Supersedes 001 (never applied).
--
-- Design
-- - Username + password, managed here (not Supabase Auth), so usernames can be any text.
--   Password may be blank for now. Passwords are stored as bcrypt hashes (pgcrypto).
-- - Tables have RLS on and NO policies, so anon and authenticated roles cannot read or
--   write them directly. The app only calls the ss_* functions below, which are
--   security definer, have a fixed search_path, and never build SQL from text.
-- - Sessions: a random token is returned once; only its SHA-256 hash is stored.
-- - Usernames are unique case-insensitively. A new username creates the account on first sign-in.
--
-- Run this whole file once in the SQL editor of the Architecture project.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- tables

create table if not exists public.ss_users (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(username) between 3 and 64),
  username_key text generated always as (lower(username)) stored,
  password_hash text not null,
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

alter table public.ss_users enable row level security;
alter table public.ss_sessions enable row level security;
alter table public.ss_projects enable row level security;
alter table public.ss_templates enable row level security;
alter table public.ss_lessons enable row level security;

revoke all on public.ss_users, public.ss_sessions, public.ss_projects, public.ss_templates, public.ss_lessons
  from anon, authenticated;

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

-- Signs in, or creates the account if the username is new. Returns a token once.
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

  select * into v_user from public.ss_users u where u.username_key = lower(v_name);
  if not found then
    insert into public.ss_users (username, password_hash)
    values (v_name, extensions.crypt(v_pass, extensions.gen_salt('bf')))
    returning * into v_user;
  elsif v_user.password_hash is distinct from extensions.crypt(v_pass, v_user.password_hash) then
    raise exception 'wrong password';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.ss_sessions (token_hash, user_id, expires_at)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), v_user.id, now() + interval '30 days');
  delete from public.ss_sessions where expires_at < now();

  return jsonb_build_object('token', v_token, 'username', v_user.username);
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
  ('ss_users', 'Shimmy Specs', 'Accounts: username and password hash. No direct access; use the ss_ functions'),
  ('ss_sessions', 'Shimmy Specs', 'Session token hashes with expiry. No direct access'),
  ('ss_projects', 'Shimmy Specs', 'Cloud projects per account (state as JSON). No direct access'),
  ('ss_templates', 'Shimmy Specs', 'Section templates (versioned JSON), shared library. Not yet used by the app'),
  ('ss_lessons', 'Shimmy Specs', 'Lessons tied to a section or question; no project details. Not yet used by the app')
) as v(t, p, u)
where not exists (select 1 from public.table_index x where x.table_name = v.t);
