-- Generate Clouds: allow YOUR account to keep notes (once per database). Paste in the Architecture project's SQL editor.
-- Only accounts in public.platform_owners can read or write gc_notes from the page. Everyone else, including anyone
-- who signs up (sign-ups are open on this project), gets nothing. You never copy an id: you type the email you sign in with.
--
-- 1. Replace PASTE-YOUR-SIGN-IN-EMAIL-HERE (keep the quotes) with the email you sign in to the page with.
-- 2. Run. Expect one row with added = 1 (or 0 if you were already added). added = 0 and owner_rows = 0 means the email did not match an account.
-- Nothing personal is kept in this file; the email is typed in your dashboard and never committed.
with ins as (
  insert into public.platform_owners (user_id, note)
  select id, 'owner' from auth.users where email = 'PASTE-YOUR-SIGN-IN-EMAIL-HERE'
  on conflict (user_id) do nothing
  returning 1
)
select (select count(*) from ins) as added;

-- 3. Check. Expect owner_rows = 1.
select count(*) as owner_rows from public.platform_owners;
