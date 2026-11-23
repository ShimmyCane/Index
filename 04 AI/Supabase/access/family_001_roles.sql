-- Family project: account roles, and withdrawals approved only by owner or parent.
-- Roles: owner (the admin account), parent, kid, guest. Kids and guests can use the app but cannot approve money.
-- Paste by hand in the Family project SQL editor, after family_test_001.sql passes.
-- The owner row goes to the one existing account. The script stops if there is not exactly one.

create table if not exists public.family_user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner', 'parent', 'kid', 'guest')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.family_user_roles enable row level security;
revoke all on public.family_user_roles from anon, authenticated;
grant select on public.family_user_roles to authenticated;
create policy "own role is readable" on public.family_user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.family_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.family_user_roles where user_id = auth.uid();
$$;
revoke execute on function public.family_role() from anon;
grant execute on function public.family_role() to authenticated;

do $$
declare n int;
begin
  select count(*) into n from auth.users;
  if n <> 1 then
    raise exception 'expected exactly one account, found %. Set the owner row by hand.', n;
  end if;
  insert into public.family_user_roles (user_id, role)
    select id, 'owner' from auth.users
    on conflict (user_id) do nothing;
end $$;

create or replace function public.approve_allowance_withdrawal(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  r      public.allowance_withdrawal_requests%rowtype;
  tx_id  uuid;
begin
  if coalesce(public.family_role(), '') not in ('owner', 'parent') then
    raise exception 'only an owner or parent can approve a withdrawal';
  end if;

  select * into r
  from public.allowance_withdrawal_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'withdrawal request % not found', p_request_id;
  end if;

  if r.status = 'approved' then
    return r.approved_transaction_id;
  end if;

  if r.status <> 'pending' then
    raise exception 'withdrawal request is %, cannot approve', r.status;
  end if;

  insert into public.allowance_transactions (member_name, type, amount, note)
  values (r.member_name, 'withdrawal', r.requested_amount, r.purpose)
  returning id into tx_id;

  update public.allowance_withdrawal_requests
  set status = 'approved',
      approved_transaction_id = tx_id,
      reviewed_at = timezone('utc', now())
  where id = p_request_id;

  return tx_id;
end;
$$;
revoke execute on function public.approve_allowance_withdrawal(uuid) from anon;
grant execute on function public.approve_allowance_withdrawal(uuid) to authenticated;

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
select 'family-access', 'family_user_roles', 'table', 'owner',
       'Account roles: owner, parent, kid, guest. Written by hand only.', 'Index'
where not exists (select 1 from public.app_table_registry where object_name = 'family_user_roles');
