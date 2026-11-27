-- Colores Azules: owner-only tables in the Architecture project.
-- Writes and reads need the owner's sign-in (public.platform_is_owner()).
-- Anon has no access. Re-runnable.

-- 1. Batches of 64 (one row per batch the owner works through)
create table if not exists public.ca_batches (
    id          bigint generated always as identity primary key,
    owner_id    uuid not null default auth.uid(),
    layout      smallint not null default 8 check (layout in (8, 16)),
    kept_count  integer not null default 0,
    finished    boolean not null default false,
    device      text not null default '',
    started_at  timestamptz not null default timezone('utc', now())
);

-- 2. Choices: each swipe, each tapped square and each duel outcome
create table if not exists public.ca_choices (
    id          bigint generated always as identity primary key,
    owner_id    uuid not null default auth.uid(),
    batch_id    bigint references public.ca_batches (id) on delete cascade,
    set_no      smallint,
    kind        text not null check (kind in ('keep', 'pass', 'pick')),
    hex         text not null check (hex ~ '^#[0-9A-F]{6}$'),
    hue         smallint not null,
    sat         smallint not null,
    light       smallint not null,
    client_time timestamptz,
    created_at  timestamptz not null default timezone('utc', now())
);

-- 3. Head-to-head duels in the tournament
create table if not exists public.ca_duels (
    id          bigint generated always as identity primary key,
    owner_id    uuid not null default auth.uid(),
    batch_id    bigint references public.ca_batches (id) on delete cascade,
    round       text not null,
    winner_hex  text not null check (winner_hex ~ '^#[0-9A-F]{6}$'),
    loser_hex   text not null check (loser_hex ~ '^#[0-9A-F]{6}$'),
    client_time timestamptz,
    created_at  timestamptz not null default timezone('utc', now())
);

-- 4. Taste profile: one row per owner, the learned weights
create table if not exists public.ca_taste (
    owner_id    uuid primary key default auth.uid(),
    prefs       jsonb not null default '{}'::jsonb,
    updated_at  timestamptz not null default timezone('utc', now())
);

create index if not exists ca_choices_owner_created on public.ca_choices (owner_id, created_at);
create index if not exists ca_duels_owner_created on public.ca_duels (owner_id, created_at);

-- Row level security on, anon out, owner-only policies
alter table public.ca_batches enable row level security;
alter table public.ca_choices enable row level security;
alter table public.ca_duels enable row level security;
alter table public.ca_taste enable row level security;

revoke all on public.ca_batches from anon;
revoke all on public.ca_choices from anon;
revoke all on public.ca_duels from anon;
revoke all on public.ca_taste from anon;

grant select, insert, update, delete on public.ca_batches to authenticated;
grant select, insert, update, delete on public.ca_choices to authenticated;
grant select, insert, update, delete on public.ca_duels to authenticated;
grant select, insert, update, delete on public.ca_taste to authenticated;

drop policy if exists "owner full access" on public.ca_batches;
create policy "owner full access" on public.ca_batches
    for all to authenticated using (public.platform_is_owner()) with check (public.platform_is_owner());

drop policy if exists "owner full access" on public.ca_choices;
create policy "owner full access" on public.ca_choices
    for all to authenticated using (public.platform_is_owner()) with check (public.platform_is_owner());

drop policy if exists "owner full access" on public.ca_duels;
create policy "owner full access" on public.ca_duels
    for all to authenticated using (public.platform_is_owner()) with check (public.platform_is_owner());

drop policy if exists "owner full access" on public.ca_taste;
create policy "owner full access" on public.ca_taste
    for all to authenticated using (public.platform_is_owner()) with check (public.platform_is_owner());

-- Registry: the architecture project uses table_index
insert into public.table_index (table_name, project, purpose) values
  ('ca_batches', 'Colores Azules', 'Batches of 64 blues worked through (owner only)'),
  ('ca_choices', 'Colores Azules', 'Each keep, pass or tapped square, with its hue, saturation and lightness (owner only)'),
  ('ca_duels', 'Colores Azules', 'Head-to-head tournament results (owner only)'),
  ('ca_taste', 'Colores Azules', 'Learned taste weights, one row per owner (owner only)')
on conflict (table_name) do nothing;
