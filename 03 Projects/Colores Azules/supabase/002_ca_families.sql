-- Colores Azules: other colour families (pure, mixed, palettes of five) in ca_choices.
-- Adds two nullable/defaulted columns. Existing rows are blue choices (family 'blue').
alter table public.ca_choices
  add column if not exists family text not null default 'blue',
  add column if not exists palette_id text;
create index if not exists ca_choices_family on public.ca_choices (family);
