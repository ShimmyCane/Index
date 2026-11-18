-- General notes for the family project: one table for every project and sub-project,
-- and an index table that says what each identifier code means.
-- NOT applied yet. Jimmy pastes it into the Family project after the test file passes.
-- Table names are general (no app prefix), so every project shares them.

create table if not exists public.gen_notes (
  identifier text primary key,                 -- N-0001, never changed
  project text not null,                       -- e.g. 'Paper Airplanes x A-10 Warthog'
  sub_project text not null default '',        -- e.g. 'A-10 jet / chase'
  status text not null default 'open' check (status in ('open', 'done', 'closed')),
  description text not null,
  item text not null default '',               -- what was on screen
  identifiers jsonb not null default '{}'::jsonb, -- { "HP": 72, "TIME": "3:12", ... }
  version text not null default '',
  noted_at timestamptz not null default now()  -- never changed
);

create index if not exists gen_notes_project_idx on public.gen_notes (project, sub_project, status);

create table if not exists public.gen_notes_index (
  code text primary key,                       -- HP, TIME, ALT …
  project text not null default 'all',         -- 'all' or one project's name
  name text not null,
  meaning text not null,
  unit text not null default '',
  sort_order int not null default 0
);

alter table public.gen_notes enable row level security;
alter table public.gen_notes_index enable row level security;
revoke all on public.gen_notes from anon;
revoke all on public.gen_notes_index from anon;
grant select, insert, update on public.gen_notes to authenticated;
grant select, insert, update on public.gen_notes_index to authenticated;

drop policy if exists "Family can add gen_notes" on public.gen_notes;
create policy "Family can add gen_notes" on public.gen_notes
  for insert to authenticated with check (true);

drop policy if exists "Family can read gen_notes" on public.gen_notes;
create policy "Family can read gen_notes" on public.gen_notes
  for select to authenticated using (true);

drop policy if exists "Family can update gen_notes status" on public.gen_notes;
create policy "Family can update gen_notes status" on public.gen_notes
  for update to authenticated using (true) with check (true);

drop policy if exists "Family can read gen_notes_index" on public.gen_notes_index;
create policy "Family can read gen_notes_index" on public.gen_notes_index
  for select to authenticated using (true);

drop policy if exists "Family can add gen_notes_index" on public.gen_notes_index;
create policy "Family can add gen_notes_index" on public.gen_notes_index
  for insert to authenticated with check (true);

insert into public.app_table_registry (app, object_name, object_type, access, description, repo)
values
  ('general-notes', 'gen_notes', 'table', 'family', 'Notes for improvement, all projects', 'ShimmyCane/Index'),
  ('general-notes', 'gen_notes_index', 'table', 'family', 'What each note identifier code means', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
