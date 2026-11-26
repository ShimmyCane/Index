-- ============================================================================
-- Massage Map: family sign-in links, flags and ratings (Family project, prefix mm_)
-- App slug: massage-map. Folder: 03 Projects/Massage Map/supabase/
--
-- PASTE ORDER (by hand, in the SQL editor of the Family project):
--   1. test_001_mm_family.sql    rolled back; every check says PASS, nothing is kept
--   2. 001_mm_family.sql         this file; re-runnable
--   3. verify_001_mm_family.sql  read only; compare with the expected results in its header
--
-- Never put an email address or a password in this file or in the repo.
-- After Ying and Jimmy have each signed in once, link their sign-in ids by hand
-- (copy each id from Authentication > Users in the dashboard):
--   insert into public.mm_members (user_id, person) values
--     ('<Ying auth user id>', 'Ying'),
--     ('<Jimmy auth user id>', 'Jimmy')
--   on conflict (user_id) do nothing;
-- ============================================================================

-- Who is who: one row per family sign-in. Written by hand only.
create table if not exists public.mm_members (
    user_id    uuid primary key,                       -- auth.users.id; set by hand
    person     text not null check (person in ('Ying', 'Jimmy')),
    created_at timestamptz not null default timezone('utc', now())
);

-- Each person's flags on body structures (muscles, bones, tendons, nerves and so on).
create table if not exists public.mm_flags (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null default auth.uid(),
    person        text not null check (person in ('Ying', 'Jimmy')),
    structure_key text not null check (char_length(structure_key) between 1 and 200),
    liked         boolean not null default true,
    updated_at    timestamptz not null default timezone('utc', now()),
    unique (user_id, structure_key)
);

-- Each person's star rating (0 to 5) for each technique.
create table if not exists public.mm_ratings (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null default auth.uid(),
    person        text not null check (person in ('Ying', 'Jimmy')),
    technique_key text not null check (char_length(technique_key) between 1 and 80),
    stars         smallint not null check (stars between 0 and 5),
    updated_at    timestamptz not null default timezone('utc', now()),
    unique (user_id, technique_key)
);

alter table public.mm_members enable row level security;
alter table public.mm_flags   enable row level security;
alter table public.mm_ratings enable row level security;

-- The person linked to the signed-in user, or null for anyone who is not on the family list.
create or replace function public.mm_member_person()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select m.person from public.mm_members m where m.user_id = auth.uid();
$$;

revoke execute on function public.mm_member_person() from anon;
grant execute on function public.mm_member_person() to authenticated;

-- mm_members: nobody but the SQL editor writes it. A signed-in user reads only their own row.
revoke all on public.mm_members from anon, authenticated;
grant select on public.mm_members to authenticated;

drop policy if exists "mm_members own row" on public.mm_members;
create policy "mm_members own row" on public.mm_members
    for select to authenticated
    using (user_id = auth.uid());

-- mm_flags: family members read everyone's flags; each member writes only their own rows.
revoke all on public.mm_flags from anon, authenticated;
grant select, insert, update, delete on public.mm_flags to authenticated;

drop policy if exists "mm_flags family read" on public.mm_flags;
create policy "mm_flags family read" on public.mm_flags
    for select to authenticated
    using (public.mm_member_person() is not null);

drop policy if exists "mm_flags own insert" on public.mm_flags;
create policy "mm_flags own insert" on public.mm_flags
    for insert to authenticated
    with check (user_id = auth.uid() and person = public.mm_member_person());

drop policy if exists "mm_flags own update" on public.mm_flags;
create policy "mm_flags own update" on public.mm_flags
    for update to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid() and person = public.mm_member_person());

drop policy if exists "mm_flags own delete" on public.mm_flags;
create policy "mm_flags own delete" on public.mm_flags
    for delete to authenticated
    using (user_id = auth.uid());

-- mm_ratings: the same rules as mm_flags.
revoke all on public.mm_ratings from anon, authenticated;
grant select, insert, update, delete on public.mm_ratings to authenticated;

drop policy if exists "mm_ratings family read" on public.mm_ratings;
create policy "mm_ratings family read" on public.mm_ratings
    for select to authenticated
    using (public.mm_member_person() is not null);

drop policy if exists "mm_ratings own insert" on public.mm_ratings;
create policy "mm_ratings own insert" on public.mm_ratings
    for insert to authenticated
    with check (user_id = auth.uid() and person = public.mm_member_person());

drop policy if exists "mm_ratings own update" on public.mm_ratings;
create policy "mm_ratings own update" on public.mm_ratings
    for update to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid() and person = public.mm_member_person());

drop policy if exists "mm_ratings own delete" on public.mm_ratings;
create policy "mm_ratings own delete" on public.mm_ratings
    for delete to authenticated
    using (user_id = auth.uid());

-- Register every object in the same file (rules: 04 AI/Supabase/brief.md).
insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('massage-map', 'mm_members',       'table',    'owner', 'Which family sign-in is which person (Ying or Jimmy). Written by hand.', 'ShimmyCane/Index'),
('massage-map', 'mm_flags',         'table',    'owner', 'Massage Map: body structures each person likes (muscles, bones, tendons, nerves).', 'ShimmyCane/Index'),
('massage-map', 'mm_ratings',       'table',    'owner', 'Massage Map: 0 to 5 stars per person per technique.', 'ShimmyCane/Index'),
('massage-map', 'mm_member_person', 'function', 'owner', 'Massage Map: the person linked to the signed-in user, or null.', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
