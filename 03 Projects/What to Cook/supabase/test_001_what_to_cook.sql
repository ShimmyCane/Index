-- ============================================================================
-- What to Cook — rolled-back test. Run this BEFORE 001.
-- Expected: an error that starts with RESULT: (the error is the pass, because
-- the block rolls back and nothing is kept).
-- It uses a temporary table, so it does not need 001 to be pasted first.
-- ============================================================================
do $$
declare
    ok_kind boolean := false;
    bad_kind_rejected boolean := false;
    ok_member_row boolean := false;
begin
    -- A temporary copy of the kind rule, so the test runs before the real tables exist.
    create temp table wtc_test_items (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        kind text not null check (kind in ('dry', 'wet', 'tool', 'space'))
    ) on commit drop;

    insert into wtc_test_items (name, kind) values ('rice', 'dry');
    ok_kind := true;

    begin
        insert into wtc_test_items (name, kind) values ('mystery', 'frozen');
    exception when check_violation then
        bad_kind_rejected := true;
    end;

    -- A member id is a plain uuid, so any value is accepted without a foreign key.
    insert into wtc_test_items (name, kind) values ('spoon', 'tool');
    ok_member_row := true;

    raise exception 'RESULT: ok_kind=% bad_kind_rejected=% ok_member_row=% (all three must be true)',
        ok_kind, bad_kind_rejected, ok_member_row;
end $$;
