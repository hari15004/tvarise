create policy "Members can update own profile"
  on public.members for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Members can upload own profile photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'tvarise-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.members
      where user_id = (select auth.uid())
    )
  );

create policy "Members can update own profile photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'tvarise-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.members
      where user_id = (select auth.uid())
    )
  )
  with check (
    bucket_id = 'tvarise-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.members
      where user_id = (select auth.uid())
    )
  );

create policy "Members can delete own profile photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'tvarise-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.members
      where user_id = (select auth.uid())
    )
  );
