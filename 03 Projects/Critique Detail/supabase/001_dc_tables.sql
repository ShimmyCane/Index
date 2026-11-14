-- Critique Detail (03 Projects/Critique Detail): tables, storage bucket and owner-only rules.
-- Database: Architecture. Paste AFTER 000_platform_owner.sql and after test_001_dc.sql passed.
-- Re-runnable. Owner only: every policy calls public.platform_is_owner(). Anon has no access.
-- Data rule: sample, sketch and the owner's own details only. No office project details.

create table if not exists public.dc_schemas (
  key          text primary key,
  csi_division text not null,
  title        text not null,
  checklist    jsonb not null default '[]'::jsonb,
  source       text not null default 'seed',
  status       text not null default 'active',
  updated_at   timestamptz not null default now()
);
create table if not exists public.dc_details (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text not null default '',
  csi_division text not null default '',
  schema_key   text not null default '',
  source_kind  text not null default 'sample' check (source_kind in ('sample', 'sketch', 'own')),
  image_path   text not null default '',
  width        int,
  height       int,
  created_at   timestamptz not null default now()
);
create table if not exists public.dc_reviews (
  id          uuid primary key default gen_random_uuid(),
  detail_id   uuid not null references public.dc_details (id) on delete cascade,
  run_at      timestamptz not null default now(),
  mode        text not null default '',
  summary     text not null default '',
  counts      jsonb not null default '{}'::jsonb,
  markup_path text not null default '',
  report      jsonb not null default '{}'::jsonb,
  version     text not null default ''
);
create table if not exists public.dc_findings (
  id             uuid primary key default gen_random_uuid(),
  review_id      uuid not null references public.dc_reviews (id) on delete cascade,
  n              int not null,
  severity       text not null check (severity in ('CRITICAL', 'MAJOR', 'ADVISORY')),
  checklist_id   text not null default '',
  title          text not null,
  issue          text not null default '',
  recommendation text not null default '',
  basis          text not null default '',
  box_2d         jsonb,
  refs           jsonb not null default '[]'::jsonb,
  status         text not null default 'open' check (status in ('open', 'accepted', 'dismissed'))
);
create table if not exists public.dc_lessons (
  id         text primary key,
  category   text not null default '*',
  severity   text not null default 'ADVISORY',
  text       text not null,
  source     text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.dc_notes (
  id       text primary key,
  text     text not null,
  page     text not null default 'index.html',
  item     text not null default '',
  label    text not null default '',
  version  text not null default '',
  status   text not null default 'open' check (status in ('open', 'done')),
  noted_at timestamptz not null default now()
);
create index if not exists dc_reviews_detail_idx on public.dc_reviews (detail_id, run_at desc);
create index if not exists dc_findings_review_idx on public.dc_findings (review_id, n);

alter table public.dc_schemas enable row level security;
revoke all on public.dc_schemas from anon;
revoke all on public.dc_schemas from authenticated;
grant select, insert, update, delete on public.dc_schemas to authenticated;
drop policy if exists "owner full access dc_schemas" on public.dc_schemas;
create policy "owner full access dc_schemas" on public.dc_schemas for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

alter table public.dc_details enable row level security;
revoke all on public.dc_details from anon;
revoke all on public.dc_details from authenticated;
grant select, insert, update, delete on public.dc_details to authenticated;
drop policy if exists "owner full access dc_details" on public.dc_details;
create policy "owner full access dc_details" on public.dc_details for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

alter table public.dc_reviews enable row level security;
revoke all on public.dc_reviews from anon;
revoke all on public.dc_reviews from authenticated;
grant select, insert, update, delete on public.dc_reviews to authenticated;
drop policy if exists "owner full access dc_reviews" on public.dc_reviews;
create policy "owner full access dc_reviews" on public.dc_reviews for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

alter table public.dc_findings enable row level security;
revoke all on public.dc_findings from anon;
revoke all on public.dc_findings from authenticated;
grant select, insert, update, delete on public.dc_findings to authenticated;
drop policy if exists "owner full access dc_findings" on public.dc_findings;
create policy "owner full access dc_findings" on public.dc_findings for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

alter table public.dc_lessons enable row level security;
revoke all on public.dc_lessons from anon;
revoke all on public.dc_lessons from authenticated;
grant select, insert, update, delete on public.dc_lessons to authenticated;
drop policy if exists "owner full access dc_lessons" on public.dc_lessons;
create policy "owner full access dc_lessons" on public.dc_lessons for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

alter table public.dc_notes enable row level security;
revoke all on public.dc_notes from anon;
revoke all on public.dc_notes from authenticated;
grant select, insert, update, delete on public.dc_notes to authenticated;
drop policy if exists "owner full access dc_notes" on public.dc_notes;
create policy "owner full access dc_notes" on public.dc_notes for all to authenticated
  using (public.platform_is_owner()) with check (public.platform_is_owner());

insert into storage.buckets (id, name, public) values ('dc-details', 'dc-details', false)
on conflict (id) do nothing;
drop policy if exists "owner full access dc-details" on storage.objects;
create policy "owner full access dc-details" on storage.objects for all to authenticated
  using (bucket_id = 'dc-details' and public.platform_is_owner())
  with check (bucket_id = 'dc-details' and public.platform_is_owner());

insert into public.table_index (table_name, project, purpose) values
  ('dc_schemas',  'Critique Detail', 'CSI rulebooks: one checklist per detail type (seed or auto-generated)'),
  ('dc_details',  'Critique Detail', 'One row per reviewed detail; the image is in storage bucket dc-details'),
  ('dc_reviews',  'Critique Detail', 'One row per review run: mode, summary, counts, full report JSON, markup path'),
  ('dc_findings', 'Critique Detail', 'Numbered findings of a review with severity, box and status'),
  ('dc_lessons',  'Critique Detail', 'Lessons learned by rulebook category (no project or client names)'),
  ('dc_notes',    'Critique Detail', 'Notes for improvement left in the viewer page')
on conflict (table_name) do update set project = excluded.project, purpose = excluded.purpose;
