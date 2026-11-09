-- ============================================================================
-- Test for 001_bglide_family.sql. Paste into the Family project's SQL editor and Run FIRST.
-- It creates the tables, saves and reads one row each, then raises an error on purpose.
-- The error rolls everything back, so nothing is left behind.
-- The pass is the message that starts with RESULT:, expecting: tables=2 scores=1 notes=1
-- ============================================================================
do $$
declare
    scores_count int;
    notes_count int;
    tables_count int;
begin
    create table public.bglide_scores (
        id text primary key,
        initials text not null check (length(initials) between 1 and 3),
        score integer not null check (score >= 0),
        round integer not null default 1 check (round >= 1),
        version text not null default '',
        played_at timestamptz not null default timezone('utc', now()),
        created_by uuid default auth.uid(),
        created_at timestamptz not null default timezone('utc', now())
    );
    create table public.bglide_notes (
        id text primary key,
        text text not null check (length(text) between 1 and 2000),
        item text not null default '',
        label text not null default '',
        version text not null default '',
        status text not null default 'open' check (status in ('open', 'done')),
        noted_at timestamptz not null default timezone('utc', now()),
        created_by uuid default auth.uid(),
        created_at timestamptz not null default timezone('utc', now())
    );
    alter table public.bglide_scores enable row level security;
    alter table public.bglide_notes enable row level security;

    insert into public.bglide_scores (id, initials, score, round, version) values ('s-test-1', 'AAA', 1250, 3, '0.1.0');
    insert into public.bglide_notes (id, text, item, label, version)
        values ('n-test-1', 'Customers could be bigger', 'round-1', 'Round 1 · 4 bars · saloon', '0.1.0');

    select count(*) into scores_count from public.bglide_scores;
    select count(*) into notes_count from public.bglide_notes;
    select count(*) into tables_count from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname in ('bglide_scores', 'bglide_notes') and c.relrowsecurity;

    raise exception 'RESULT: tables=% scores=% notes=%', tables_count, scores_count, notes_count;
end $$;
