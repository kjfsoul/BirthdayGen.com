insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', true)
on conflict (id) do nothing;

-- Policy: Public Access (View)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'user-uploads' );

-- Policy: Authenticated users can upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'user-uploads' and auth.role() = 'authenticated' );

-- Policy: Users can update their own objects
create policy "Users can update own objects"
  on storage.objects for update
  using ( bucket_id = 'user-uploads' and auth.uid() = owner );

-- Policy: Users can delete their own objects
create policy "Users can delete own objects"
  on storage.objects for delete
  using ( bucket_id = 'user-uploads' and auth.uid() = owner );
