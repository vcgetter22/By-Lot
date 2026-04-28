-- By Lot. — Row-Level Security policies for the submissions table.
-- Safe to run more than once: existing policies with these names are dropped first.
--
-- After this runs:
--   anon  can SELECT every row
--   anon  can INSERT a real submission (chapter whitelist, non-empty content, is_seed=false)
--   anon  CANNOT update or delete anything
-- The dashboard runs as service-role and bypasses RLS, so the owner can still moderate.

alter table public.submissions enable row level security;

drop policy if exists "anon can read submissions" on public.submissions;
create policy "anon can read submissions"
  on public.submissions for select
  to anon, authenticated
  using (true);

drop policy if exists "anon can submit" on public.submissions;
create policy "anon can submit"
  on public.submissions for insert
  to anon, authenticated
  with check (
    chapter in ('believe','govern','silence','lesser','drawn','imagine','objection','future','speech')
    and length(btrim(content)) > 0
    and (is_seed is null or is_seed = false)
  );

-- Verify (returns one row per active policy on submissions)
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'submissions'
order by policyname;
