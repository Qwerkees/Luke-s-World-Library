-- Private owner-scoped storage for LUKE'S WORLD LIBRARY.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lukes-private-library',
  'Luke''s Private Library',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Private library owners can read their files" on storage.objects;
create policy "Private library owners can read their files"
on storage.objects for select to authenticated
using (
  bucket_id = 'lukes-private-library'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Private library owners can upload their files" on storage.objects;
create policy "Private library owners can upload their files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'lukes-private-library'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Private library owners can update their files" on storage.objects;
create policy "Private library owners can update their files"
on storage.objects for update to authenticated
using (
  bucket_id = 'lukes-private-library'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'lukes-private-library'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Private library owners can delete their files" on storage.objects;
create policy "Private library owners can delete their files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'lukes-private-library'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
