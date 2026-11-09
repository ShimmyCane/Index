-- ============================================================================
-- Bar Glide: top scores and notes for improvement (Family project).
-- Paste the whole file into the Family project's SQL editor and press Run.
-- Re-runnable. Prefix bglide_. Family project only.
-- Run supabase/test_001_bglide_family.sql first.
-- ============================================================================

-- One row per saved score (initials only, never a name).
create table if not exists public.bglide_scores (
    id              text primary key,                       -- made on the device, never changed
    initials        text not null check (length(initials) between 1 and 3),
    score           integer not null check (score >= 0),
    round           integer not null default 1 check (round >= 1),
    version         text not null default '',               -- game version
    played_at       timestamptz not null default timezone('utc', now()),
    created_by      uuid default auth.uid(),
    created_at      timestamptz not null default timezone('utc', now())
);
alter table public.bglide_scores enable row level security;
revoke all on public.bglide_scores from anon;
drop policy if exists "Authenticated can manage bglide_scores" on public.bglide_scores;
create policy "Authenticated can manage bglide_scores" on public.bglide_scores
    for all to authenticated using (true) with check (true);

-- Notes for improvement typed in the game (text only).
create table if not exists public.bglide_notes (
    id              text primary key,                       -- made on the device, never changed
    text            text not null check (length(text) between 1 and 2000),
    item            text not null default '',               -- 'title' or 'round-3'
    label           text not null default '',               -- round, bars and room, as the tester saw it
    version         text not null default '',
    status          text not null default 'open' check (status in ('open', 'done')),
    noted_at        timestamptz not null default timezone('utc', now()),
    created_by      uuid default auth.uid(),
    created_at      timestamptz not null default timezone('utc', now())
);
alter table public.bglide_notes enable row level security;
revoke all on public.bglide_notes from anon;
drop policy if exists "Authenticated can manage bglide_notes" on public.bglide_notes;
create policy "Authenticated can manage bglide_notes" on public.bglide_notes
    for all to authenticated using (true) with check (true);

-- Registry: this app owns both tables.
insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('bar-glide', 'bglide_scores', 'table', 'owner', 'Bar Glide: top scores (initials, score, round).', 'ShimmyCane/Index'),
('bar-glide', 'bglide_notes', 'table', 'owner', 'Bar Glide: notes for improvement typed in the game.', 'ShimmyCane/Index')
on conflict (app, object_name) do nothing;
