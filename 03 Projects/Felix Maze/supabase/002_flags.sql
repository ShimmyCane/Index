-- ============================================================================
-- Felix Maze — puzzles flagged for rework
-- Family Supabase project. Signed-in users only. Prefix: fmz_  App: felix-maze
-- Applied as migration `felix_maze_flags`. Independent of 001_felix_maze.sql.
--
-- A flag is opened from a sheet's page (🚩 Flag). The fix_puzzles skill reads the open ones,
-- repairs or replaces the puzzle, and closes the flag with a note in `resolution`.
-- Keyed by the counter n (stable) plus the code at the time (family, level and source can
-- change when a puzzle is re-leveled).
-- ============================================================================

create table public.fmz_flags (
    id          uuid primary key default gen_random_uuid(),
    n           integer not null,
    code        text not null,
    reason      text not null check (reason in ('answer', 'hard', 'easy', 'ugly', 'unsuitable', 'other')),
    note        text not null default '',
    status      text not null default 'open' check (status in ('open', 'fixed', 'replaced', 'kept')),
    resolution  text not null default '',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    resolved_at timestamptz,
    unique (n, created_at)
);
alter table public.fmz_flags enable row level security;
create index fmz_flags_open on public.fmz_flags (n) where status = 'open';

create policy "Authenticated can manage fmz_flags" on public.fmz_flags for all to authenticated using (true) with check (true);
revoke all on public.fmz_flags from anon;

insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('felix-maze', 'fmz_flags', 'table', 'owner', 'Puzzles flagged for rework, read and closed by the fix_puzzles skill.', 'ShimmyCane/Index');

-- Check: this should list only other apps' objects (storytime_*), never fmz_*.
-- select * from public.app_table_unregistered;
