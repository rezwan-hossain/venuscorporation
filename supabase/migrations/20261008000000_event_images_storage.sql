-- Local development only (applied by `npx supabase start` / `supabase db reset`).
-- The admin image uploader (module/profile/components/admin/ImageUpload.tsx)
-- uploads and deletes with the logged-in user's session, so signed-in users
-- need write access to the public "event-images" bucket.

create policy "event-images: signed-in users can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-images');

create policy "event-images: signed-in users can update"
  on storage.objects for update to authenticated
  using (bucket_id = 'event-images');

create policy "event-images: signed-in users can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'event-images');
