-- ============================================================================
-- NazProject — Storage buckets + access helper
-- ============================================================================

-- Storage buckets ------------------------------------------------------------
-- covers / avatars are public (served on cards). videos / pdfs are public too
-- for Phase 1 simplicity, but premium LESSONS are gated at the app layer
-- (the file URL is only rendered to entitled users). If you later need hard
-- file-level protection, switch videos/pdfs to private + signed URLs.
insert into storage.buckets (id, name, public)
values
  ('covers',  'covers',  true),
  ('avatars', 'avatars', true),
  ('videos',  'videos',  true),
  ('pdfs',    'pdfs',    true)
on conflict (id) do nothing;

-- Public read for all four buckets.
create policy "public read covers"  on storage.objects for select using (bucket_id = 'covers');
create policy "public read avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "public read videos"  on storage.objects for select using (bucket_id = 'videos');
create policy "public read pdfs"    on storage.objects for select using (bucket_id = 'pdfs');

-- Only admins can upload / modify / delete media.
create policy "admin write media" on storage.objects for insert
  with check (bucket_id in ('covers','avatars','videos','pdfs') and is_admin());
create policy "admin update media" on storage.objects for update
  using (bucket_id in ('covers','avatars','videos','pdfs') and is_admin());
create policy "admin delete media" on storage.objects for delete
  using (bucket_id in ('covers','avatars','videos','pdfs') and is_admin());

-- Allow a signed-in student to upload/replace their OWN avatar.
create policy "student own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- ============================================================================
-- has_course_access(course_id)  → boolean
-- Does the current user have access to a course's premium content?
--   free course          → true for everyone
--   premium course       → true if admin, or has a 'granted' entitlement
-- ============================================================================
create or replace function has_course_access(p_course_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_premium boolean;
begin
  select is_premium into v_premium from courses where id = p_course_id;
  if v_premium is null then return false; end if;
  if not v_premium then return true; end if;        -- free course
  if is_admin() then return true; end if;
  return exists (
    select 1 from entitlements
    where course_id = p_course_id
      and user_id = auth.uid()
      and status = 'granted'
  );
end;
$$;
