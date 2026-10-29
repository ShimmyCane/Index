-- Shimmy Specs — test for 002, rolled back. Run AFTER 002_shimmy_specs_accounts.sql.
-- Everything is undone: the final RAISE always rolls the transaction back.
-- Read the message in the results: it says PASS, or the first check that failed.
-- It adds two TEST usernames to the allowed list inside the rolled-back block only.

do $test$
declare
  v_token text;
  v_again text;
  v_id uuid;
  v_count int;
  v_state jsonb;
  v_result jsonb;
  v_failed text := null;
  i int;
begin
  insert into public.ss_allowed_users (username_key) values ('rollback test user'), ('rollback other user');

  -- 1. first sign-in creates the account with a blank password
  v_result := public.ss_sign_in('rollback test user', '');
  v_token := v_result ->> 'token';
  if (v_result ->> 'ok')::boolean is not true or v_token is null or char_length(v_token) <> 64 then
    v_failed := '1 first sign-in';
  end if;

  -- 2. sign in again with the same blank password
  v_result := public.ss_sign_in('ROLLBACK TEST USER', '');
  v_again := v_result ->> 'token';
  if (v_result ->> 'ok')::boolean is not true or v_again = v_token then
    v_failed := coalesce(v_failed, '2 second sign-in');
  end if;

  -- 3. wrong password is refused and counted
  v_result := public.ss_sign_in('rollback test user', 'not the password');
  if (v_result ->> 'ok')::boolean is not false or v_result ->> 'error' <> 'wrong password' then
    v_failed := coalesce(v_failed, '3 wrong password not refused');
  end if;

  -- 4. five wrong passwords lock the account; the right password is then refused too
  for i in 1..4 loop
    perform public.ss_sign_in('rollback test user', 'wrong ' || i);
  end loop;
  v_result := public.ss_sign_in('rollback test user', '');
  if (v_result ->> 'ok')::boolean is true then
    v_failed := coalesce(v_failed, '4 not locked after 5 wrong passwords');
  end if;
  update public.ss_users set locked_until = null, failed_count = 0 where username_key = 'rollback test user';

  -- 5. a username that is not on the allowed list is refused
  begin
    perform public.ss_sign_in('rollback stranger', '');
    v_failed := coalesce(v_failed, '5 unlisted username accepted');
  exception when others then
    if sqlerrm <> 'this username is not allowed to sign in' then
      v_failed := coalesce(v_failed, '5 unexpected error: ' || sqlerrm);
    end if;
  end;

  -- 6. injection-shaped username is refused and does not touch the table
  begin
    perform public.ss_sign_in('x''); drop table public.ss_users; --', '');
    v_failed := coalesce(v_failed, '6 injection-shaped username accepted');
  exception when others then
    if sqlerrm not like 'username must be%' then
      v_failed := coalesce(v_failed, '6 unexpected error: ' || sqlerrm);
    end if;
  end;

  -- 7. save, list, load, update
  v_id := public.ss_save_project(v_token, null, 'Rollback project', 'sketch', '{"answers":{"scope":["repair"]}}'::jsonb);
  select count(*) into v_count from public.ss_list_projects(v_token);
  if v_count <> 1 then v_failed := coalesce(v_failed, '7 list count ' || v_count); end if;
  v_id := public.ss_save_project(v_token, v_id, 'Rollback project renamed', 'sketch', '{"answers":{}}'::jsonb);
  v_state := public.ss_load_project(v_token, v_id);
  if v_state <> '{"answers":{}}'::jsonb then v_failed := coalesce(v_failed, '7 load after update'); end if;

  -- 8. another user cannot change the project
  v_result := public.ss_sign_in('rollback other user', '');
  begin
    perform public.ss_save_project(v_result ->> 'token', v_id, 'x', 'sketch', '{}'::jsonb);
    v_failed := coalesce(v_failed, '8 other user updated the project');
  exception when others then
    if sqlerrm <> 'project not found' then
      v_failed := coalesce(v_failed, '8 unexpected error: ' || sqlerrm);
    end if;
  end;

  -- 9. sign-out ends the session
  perform public.ss_sign_out(v_token);
  begin
    perform public.ss_list_projects(v_token);
    v_failed := coalesce(v_failed, '9 session still valid after sign-out');
  exception when others then
    if sqlerrm <> 'session expired, sign in again' then
      v_failed := coalesce(v_failed, '9 unexpected error: ' || sqlerrm);
    end if;
  end;

  raise exception 'ROLLBACK TEST %: % (nothing was kept)',
    case when v_failed is null then 'PASS' else 'FAILED' end,
    coalesce(v_failed, 'all 9 checks');
end
$test$;
