-- Shimmy Specs — test for 002, rolled back. Run AFTER 002_shimmy_specs_accounts.sql.
-- Everything is undone: the final RAISE always rolls the transaction back.
-- Read the message in the results: it says PASS, or the first check that failed.

do $test$
declare
  v_token text;
  v_again text;
  v_id uuid;
  v_count int;
  v_state jsonb;
  v_failed text := null;
begin
  -- 1. create account with a blank password
  v_token := (public.ss_sign_in('rollback test user', '') ->> 'token');
  if v_token is null or char_length(v_token) <> 64 then v_failed := '1 token'; end if;

  -- 2. sign in again with the same blank password
  v_again := (public.ss_sign_in('ROLLBACK TEST USER', '') ->> 'token');
  if v_again is null or v_again = v_token then v_failed := coalesce(v_failed, '2 second sign-in'); end if;

  -- 3. wrong password is refused
  begin
    perform public.ss_sign_in('rollback test user', 'not the password');
    v_failed := coalesce(v_failed, '3 wrong password accepted');
  exception when others then
    if sqlerrm <> 'wrong password' then v_failed := coalesce(v_failed, '3 unexpected error: ' || sqlerrm); end if;
  end;

  -- 4. injection-shaped username is refused and does not touch the table
  begin
    perform public.ss_sign_in('x''); drop table public.ss_users; --', '');
    v_failed := coalesce(v_failed, '4 injection-shaped username accepted');
  exception when others then
    if sqlerrm not like 'username must be%' then v_failed := coalesce(v_failed, '4 unexpected error: ' || sqlerrm); end if;
  end;

  -- 5. save, list, load, update
  v_id := public.ss_save_project(v_token, null, 'Rollback project', 'sketch', '{"answers":{"scope":["repair"]}}'::jsonb);
  select count(*) into v_count from public.ss_list_projects(v_token);
  if v_count <> 1 then v_failed := coalesce(v_failed, '5 list count ' || v_count); end if;
  v_id := public.ss_save_project(v_token, v_id, 'Rollback project renamed', 'sketch', '{"answers":{}}'::jsonb);
  v_state := public.ss_load_project(v_token, v_id);
  if v_state <> '{"answers":{}}'::jsonb then v_failed := coalesce(v_failed, '5 load after update'); end if;

  -- 6. another user cannot see or change the project
  perform public.ss_sign_in('rollback other user', '');
  begin
    perform public.ss_save_project(public.ss_sign_in('rollback other user', '') ->> 'token', v_id, 'x', 'sketch', '{}'::jsonb);
    v_failed := coalesce(v_failed, '6 other user updated the project');
  exception when others then
    if sqlerrm <> 'project not found' then v_failed := coalesce(v_failed, '6 unexpected error: ' || sqlerrm); end if;
  end;

  -- 7. sign-out ends the session
  perform public.ss_sign_out(v_token);
  begin
    perform public.ss_list_projects(v_token);
    v_failed := coalesce(v_failed, '7 session still valid after sign-out');
  exception when others then
    if sqlerrm <> 'session expired, sign in again' then v_failed := coalesce(v_failed, '7 unexpected error: ' || sqlerrm); end if;
  end;

  raise exception 'ROLLBACK TEST %: % (nothing was kept)',
    case when v_failed is null then 'PASS' else 'FAILED' end,
    coalesce(v_failed, 'all 7 checks');
end
$test$;
