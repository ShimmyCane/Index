-- ============================================================================
-- Test for 001_athena_family.sql. Paste into the Family project's SQL editor and Run FIRST.
-- It creates the tables, saves and reads one row each, then raises an error on purpose.
-- The error rolls everything back, so nothing is left behind.
-- The pass is the message that starts with RESULT:, expecting: tables=2 saves=1 notes=1
-- ============================================================================
do $$
declare
    saves_count int;
    notes_count int;
    tables_count int;
begin
    create table public.athena_saves (
        save_key text primary key,
        data jsonb not null default '{}'::jsonb,
        updated_at timestamptz not null default timezone('utc', now())
    );
    create table public.athena_notes (
        id text primary key,
        text text not null check (length(text) between 1 and 2000),
        house text not null default '',
        label text not null default '',
        version text not null default '',
        status text not null default 'open' check (status in ('open', 'done')),
        noted_at timestamptz not null default timezone('utc', now()),
        created_by uuid default auth.uid(),
        created_at timestamptz not null default timezone('utc', now())
    );
    alter table public.athena_saves enable row level security;
    alter table public.athena_notes enable row level security;

    insert into public.athena_saves (save_key, data) values ('main', '{"unlocked": 2, "rooms": {}}');
    insert into public.athena_notes (id, text, house, label, version)
        values ('n-test-1', 'The bed should be bigger', 'house-0', 'Athena''s house · bed', '0.2.0');

    select count(*) into saves_count from public.athena_saves;
    select count(*) into notes_count from public.athena_notes;
    select count(*) into tables_count from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname in ('athena_saves', 'athena_notes') and c.relrowsecurity;

    raise exception 'RESULT: tables=% saves=% notes=%', tables_count, saves_count, notes_count;
end $$;
