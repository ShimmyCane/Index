-- Architecture: rolled-back test for access_requests. Nothing is kept.
-- Runs the migration inside a transaction, checks it, then rolls back.
-- Paste in the Architecture SQL editor. The result table shows each check.
begin;
create temp table res (test text, outcome text) on commit drop;

-- migration (same as architecture_001_access_requests.sql)
create table if not exists public.access_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null check (length(email) between 6 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  requested_at timestamptz not null default timezone('utc', now()),
  status       text not null default 'new' check (status in ('new', 'invited', 'declined')),
  note         text
);
alter table public.access_requests enable row level security;
revoke all on public.access_requests from anon, authenticated;
grant select, update on public.access_requests to authenticated;
create policy "owner reads access requests" on public.access_requests for select to authenticated using (public.platform_is_owner());
create policy "owner updates access requests" on public.access_requests for update to authenticated using (public.platform_is_owner()) with check (public.platform_is_owner());
create or replace function public.request_access(p_email text) returns text language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(p_email)); today_count int;
begin
  if e is null or length(e) > 254 or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'please enter a valid email address'; end if;
  select count(*) into today_count from public.access_requests where requested_at > timezone('utc', now()) - interval '1 day';
  if today_count >= 50 then raise exception 'too many requests today, please try again tomorrow'; end if;
  insert into public.access_requests (email) values (e);
  return 'Thank you. The admin will get back to you.';
end; $$;
revoke execute on function public.request_access(text) from public;
grant execute on function public.request_access(text) to anon, authenticated;

-- 1. anonymous visitor can ask for access
do $t$ declare msg text; begin
  set local role anon;
  msg := public.request_access('rolled-back-test@example.com');
  reset role;
  insert into res values ('1 anon request accepted', case when msg like 'Thank you%' then 'PASS' else 'FAIL: ' || msg end);
exception when others then reset role; insert into res values ('1 anon request accepted', 'FAIL: ' || sqlerrm);
end $t$;

-- 2. a bad address is refused
do $t$ begin
  set local role anon;
  perform public.request_access('not an email');
  reset role;
  insert into res values ('2 bad email refused', 'FAIL: accepted');
exception when others then reset role; insert into res values ('2 bad email refused', case when sqlerrm like '%valid email%' then 'PASS' else 'FAIL: ' || sqlerrm end);
end $t$;

-- 3. anonymous visitor cannot read the table
do $t$ declare n int; begin
  set local role anon;
  select count(*) into n from public.access_requests;
  reset role;
  insert into res values ('3 anon cannot read requests', 'FAIL: read ' || n || ' rows');
exception when others then reset role; insert into res values ('3 anon cannot read requests', case when sqlerrm like '%permission denied%' then 'PASS' else 'FAIL: ' || sqlerrm end);
end $t$;

-- 4. the owner can read the requests (owner = the one row in platform_owners)
do $t$ declare owner_id uuid; n int; begin
  select user_id into owner_id from public.platform_owners limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  set local role authenticated;
  select count(*) into n from public.access_requests;
  reset role;
  insert into res values ('4 owner reads requests', case when n >= 1 then 'PASS (' || n || ' rows, rolled back)' else 'FAIL: 0 rows' end);
exception when others then reset role; insert into res values ('4 owner reads requests', 'FAIL: ' || sqlerrm);
end $t$;

select test, outcome from res order by test;
rollback;
