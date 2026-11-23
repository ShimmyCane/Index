-- Family: rolled-back test for account roles and withdrawal approval. Nothing is kept.
-- Runs the migration inside a transaction, checks it, then rolls back.
begin;
create temp table res (test text, outcome text) on commit drop;

-- migration (same as family_001_roles.sql, owner row only if exactly one account)
create table if not exists public.family_user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner', 'parent', 'kid', 'guest')),
  created_at timestamptz not null default timezone('utc', now())
);
alter table public.family_user_roles enable row level security;
revoke all on public.family_user_roles from anon, authenticated;
grant select on public.family_user_roles to authenticated;
create policy "own role is readable" on public.family_user_roles for select to authenticated using (user_id = auth.uid());
create or replace function public.family_role() returns text language sql stable security definer set search_path = public as $$
  select role from public.family_user_roles where user_id = auth.uid(); $$;
revoke execute on function public.family_role() from anon;
grant execute on function public.family_role() to authenticated;
do $$ declare n int; begin
  select count(*) into n from auth.users;
  if n <> 1 then raise exception 'expected exactly one account, found %', n; end if;
  insert into public.family_user_roles (user_id, role) select id, 'owner' from auth.users on conflict (user_id) do nothing;
end $$;
create or replace function public.approve_allowance_withdrawal(p_request_id uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare r public.allowance_withdrawal_requests%rowtype; tx_id uuid;
begin
  if coalesce(public.family_role(), '') not in ('owner', 'parent') then raise exception 'only an owner or parent can approve a withdrawal'; end if;
  select * into r from public.allowance_withdrawal_requests where id = p_request_id for update;
  if not found then raise exception 'withdrawal request % not found', p_request_id; end if;
  if r.status = 'approved' then return r.approved_transaction_id; end if;
  if r.status <> 'pending' then raise exception 'withdrawal request is %, cannot approve', r.status; end if;
  insert into public.allowance_transactions (member_name, type, amount, note) values (r.member_name, 'withdrawal', r.requested_amount, r.purpose) returning id into tx_id;
  update public.allowance_withdrawal_requests set status = 'approved', approved_transaction_id = tx_id, reviewed_at = timezone('utc', now()) where id = p_request_id;
  return tx_id;
end; $$;
revoke execute on function public.approve_allowance_withdrawal(uuid) from anon;
grant execute on function public.approve_allowance_withdrawal(uuid) to authenticated;

-- test request, rolled back
create temp table t_req as select null::uuid as id;
do $t$ declare rid uuid; begin
  insert into public.allowance_withdrawal_requests (member_name, purpose, requested_amount, status)
  values ('rolled-back test', 'test', 1, 'pending') returning id into rid;
  update t_req set id = rid;
end $t$;

-- 1. the owner can approve a pending withdrawal
do $t$ declare owner_id uuid; rid uuid; st text; begin
  select user_id into owner_id from public.family_user_roles where role = 'owner';
  select id into rid from t_req;
  perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  set local role authenticated;
  perform public.approve_allowance_withdrawal(rid);
  reset role;
  select status into st from public.allowance_withdrawal_requests where id = rid;
  insert into res values ('1 owner approves', case when st = 'approved' then 'PASS' else 'FAIL: status ' || st end);
exception when others then reset role; insert into res values ('1 owner approves', 'FAIL: ' || sqlerrm);
end $t$;

-- 2. a kid is refused (owner row changed to kid for this test only, rolled back)
do $t$ declare owner_id uuid; rid uuid; begin
  select user_id into owner_id from public.family_user_roles where role = 'owner';
  update public.family_user_roles set role = 'kid' where user_id = owner_id;
  insert into public.allowance_withdrawal_requests (member_name, purpose, requested_amount, status)
  values ('rolled-back test', 'test kid', 1, 'pending') returning id into rid;
  perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  set local role authenticated;
  perform public.approve_allowance_withdrawal(rid);
  reset role;
  insert into res values ('2 kid refused', 'FAIL: kid approved');
exception when others then reset role; insert into res values ('2 kid refused', case when sqlerrm like '%only an owner or parent%' then 'PASS' else 'FAIL: ' || sqlerrm end);
end $t$;

-- 3. an anonymous visitor cannot call it
do $t$ begin
  set local role anon;
  perform public.approve_allowance_withdrawal(gen_random_uuid());
  reset role;
  insert into res values ('3 anon refused', 'FAIL: callable');
exception when others then reset role; insert into res values ('3 anon refused', case when sqlerrm like '%permission denied%' then 'PASS' else 'FAIL: ' || sqlerrm end);
end $t$;

select test, outcome from res order by test;
rollback;
