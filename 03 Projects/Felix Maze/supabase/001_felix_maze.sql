-- ============================================================================
-- Felix Maze — the maze bank, Felix's doodles, and characters
-- Family Supabase project. Signed-in users only. Prefix: fmz_  App: felix-maze
-- NOT APPLIED YET. Apply in a rolled-back transaction first (see /supabase-project).
--
-- A maze is stored as its recipe: the same recipe always rebuilds the same
-- maze, answer key and answer animation in the browser (js/sheet.js), so the
-- picture and the answer are kept only as small cached copies.
-- ============================================================================

-- One row per published or saved maze. code = family · level · source · counter (hex), e.g. 810-001.
create table public.fmz_mazes (
    id          uuid primary key default gen_random_uuid(),
    n           integer not null unique check (n between 1 and 4095),   -- the counter, shown as 3 hex digits
    family      smallint not null check (family between 1 and 15),     -- theme (catalog.md)
    level       smallint not null check (level between 1 and 15),      -- time to solve: 1 ≈ 2 min … 4 ≈ 20+ min
    source      smallint not null default 0 check (source between 0 and 15), -- 0 computer, 1 Felix's doodle, 2 hand-tuned
    code        text generated always as (
                  upper(to_hex(family) || to_hex(level) || to_hex(source)) || '-' || lpad(upper(to_hex(n)), 3, '0')
                ) stored,
    style       text not null,                                         -- js/sheet.js STYLES key
    seed        bigint not null,
    title       text not null,
    inspired    text not null default '',
    fun         text not null default '',
    tags        text[] not null default '{}',
    recipe      jsonb not null,                                        -- the full recipe (doodle strokes included)
    answer      jsonb,                                                 -- cached right-path points, for the answer page
    thumb       text,                                                  -- cached small JPEG (data URL)
    doodle_id   uuid,
    status      text not null default 'published' check (status in ('draft', 'published', 'retired')),
    qc_ok       boolean not null default false,                        -- passed the quality check (qc.md)
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
alter table public.fmz_mazes enable row level security;

-- Felix's seed drawings, kept so a maze can be regrown from them.
create table public.fmz_doodles (
    id          uuid primary key default gen_random_uuid(),
    strokes     jsonb not null check (jsonb_typeof(strokes) = 'array'), -- [[[x,y],…],…] in sheet units (1 = 0.01 inch)
    note        text not null default '',
    created_at  timestamptz not null default now()
);
alter table public.fmz_doodles enable row level security;

alter table public.fmz_mazes
    add constraint fmz_mazes_doodle_fk foreign key (doodle_id) references public.fmz_doodles (id) on delete set null;

-- The cast (characters.md is the source; this mirrors it for the library).
create table public.fmz_characters (
    key         text primary key,                                      -- js/art.js name: 'cat', 'mouse'
    name        text not null,
    role        text not null default '',
    notes       text not null default ''
);
alter table public.fmz_characters enable row level security;

create policy "Authenticated can manage fmz_mazes"      on public.fmz_mazes      for all to authenticated using (true) with check (true);
create policy "Authenticated can manage fmz_doodles"    on public.fmz_doodles    for all to authenticated using (true) with check (true);
create policy "Authenticated can manage fmz_characters" on public.fmz_characters for all to authenticated using (true) with check (true);
revoke all on public.fmz_mazes, public.fmz_doodles, public.fmz_characters from anon;

insert into public.app_table_registry (app, object_name, object_type, access, description, repo) values
('felix-maze', 'fmz_mazes',      'table', 'owner', 'Maze bank: one recipe per maze, with code, tags, cached answer and thumbnail.', 'ShimmyCane/Index'),
('felix-maze', 'fmz_doodles',    'table', 'owner', 'Felix''s seed drawings that mazes are grown from.',                          'ShimmyCane/Index'),
('felix-maze', 'fmz_characters', 'table', 'owner', 'The cast of characters used on the sheets.',                                 'ShimmyCane/Index');

-- Check: this should return no rows.
-- select * from public.app_table_unregistered;
