-- Generate Clouds: add yourself as the owner (once). Paste in the Architecture project's SQL editor.
-- The owner row is what lets your sign-in see and write gc_notes. Until it exists, every query returns nothing.
-- Nothing personal is kept in this file: the id comes from your own dashboard and is never committed.
--
-- STEP A. Run this file as it is. It only lists the newest accounts. Copy the id of YOUR account.
-- (The account must exist: Authentication > Users. Sign in on the page once if it is not there.)
select id, email, last_sign_in_at from auth.users order by last_sign_in_at desc nulls last limit 5;

-- STEP B. Delete the two dashes at the start of the next line, replace the words in capitals
-- with the id you copied (keep the quotes), and run it. Re-runnable: a second run does nothing.
-- insert into public.platform_owners (user_id, note) values ('PASTE-YOUR-USER-ID-HERE', 'owner') on conflict (user_id) do nothing;

-- STEP C. Check. Expect owner_rows = 1.
select count(*) as owner_rows from public.platform_owners;
