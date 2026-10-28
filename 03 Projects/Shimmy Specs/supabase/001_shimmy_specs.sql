-- Shimmy Specs — Architecture Supabase project (xabgankckrcuhcgdolrg).
-- WRITTEN, NOT APPLIED. Apply only through /supabase-project, after Jimmy's OK.
-- Office project data never goes here: ss_projects accepts only kind 'sketch' or 'own'.

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

create table if not exists public.ss_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('sketch', 'own')),
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ss_templates enable row level security;
alter table public.ss_lessons enable row level security;
alter table public.ss_projects enable row level security;

drop policy if exists "ss_templates signed-in" on public.ss_templates;
create policy "ss_templates signed-in" on public.ss_templates
  for all to authenticated using (true) with check (true);

drop policy if exists "ss_lessons signed-in" on public.ss_lessons;
create policy "ss_lessons signed-in" on public.ss_lessons
  for all to authenticated using (true) with check (true);

drop policy if exists "ss_projects signed-in" on public.ss_projects;
create policy "ss_projects signed-in" on public.ss_projects
  for all to authenticated using (true) with check (true);

insert into public.table_index (table_name, project, purpose)
select v.t, v.p, v.u
from (values
  ('ss_templates', 'Shimmy Specs', 'Section templates (versioned JSON), shared library'),
  ('ss_lessons', 'Shimmy Specs', 'Lessons tied to a section or question; no project details'),
  ('ss_projects', 'Shimmy Specs', 'Sketch and own projects only (kind check)')
) as v(t, p, u)
where not exists (select 1 from public.table_index x where x.table_name = v.t);
