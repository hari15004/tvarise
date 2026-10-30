-- Public images for site content; only admin accounts may upload or remove.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tvarise-media',
  'tvarise-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read Tvarise media" on storage.objects;
create policy "Public can read Tvarise media"
  on storage.objects for select
  to public
  using (bucket_id = 'tvarise-media');

drop policy if exists "Admins can upload Tvarise media" on storage.objects;
create policy "Admins can upload Tvarise media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'tvarise-media'
    and (select public.is_tvarise_admin())
  );

drop policy if exists "Admins can update Tvarise media" on storage.objects;
create policy "Admins can update Tvarise media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'tvarise-media'
    and (select public.is_tvarise_admin())
  )
  with check (
    bucket_id = 'tvarise-media'
    and (select public.is_tvarise_admin())
  );

drop policy if exists "Admins can delete Tvarise media" on storage.objects;
create policy "Admins can delete Tvarise media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'tvarise-media'
    and (select public.is_tvarise_admin())
  );
