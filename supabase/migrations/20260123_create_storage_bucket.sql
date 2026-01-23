-- Create a new private bucket 'client-uploads'
insert into storage.buckets (id, name, public)
values ('client-uploads', 'client-uploads', true) -- Public bucket for easy access
on conflict (id) do nothing;

-- Set up security policies

-- 1. Allow public uploads (INSERT)
-- WARNING: This allows anyone to upload. For a real app, you might want to restrict file types or size.
create policy "Allow public uploads"
on storage.objects for insert
with check ( bucket_id = 'client-uploads' );

-- 2. Allow public viewing (SELECT)
create policy "Allow public viewing"
on storage.objects for select
using ( bucket_id = 'client-uploads' );

-- 3. Allow updates (optional, usually not needed for simple upload)
-- create policy "Allow public updates"
-- on storage.objects for update
-- using ( bucket_id = 'client-uploads' ); 
