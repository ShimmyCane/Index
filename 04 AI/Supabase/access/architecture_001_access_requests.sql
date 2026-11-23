-- Architecture project: request-only access (no open sign-up).
-- Anyone can ask for access with an email address. Only the owner can read or update requests.
-- Paste by hand in the Architecture project SQL editor, after architecture_test_001.sql passes.

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

create policy "owner reads access requests" on public.access_requests
  for select to authenticated using (public.platform_is_owner());
create policy "owner updates access requests" on public.access_requests
  for update to authenticated using (public.platform_is_owner()) with check (public.platform_is_owner());

create or replace function public.request_access(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  e text := lower(trim(p_email));
  today_count int;
begin
  if e is null or length(e) > 254 or e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'please enter a valid email address';
  end if;
  -- simple brake on spam: at most 50 requests in any 24 hours, in total
  select count(*) into today_count from public.access_requests
    where requested_at > timezone('utc', now()) - interval '1 day';
  if today_count >= 50 then
    raise exception 'too many requests today, please try again tomorrow';
  end if;
  insert into public.access_requests (email) values (e);
  return 'Thank you. The admin will get back to you.';
end;
$$;

revoke execute on function public.request_access(text) from public;
grant execute on function public.request_access(text) to anon, authenticated;

insert into public.table_index (table_name, project, purpose)
select 'access_requests', 'Access (Architecture)', 'Email requests for access. Written only through request_access(); owner reads and updates.'
where not exists (select 1 from public.table_index where table_name = 'access_requests');
