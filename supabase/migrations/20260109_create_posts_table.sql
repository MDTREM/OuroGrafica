-- Create the posts table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  cover_image text,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table posts enable row level security;

-- Create policy to allow anyone to read published posts
create policy "Public can view published posts"
  on posts for select
  using (true);

-- Create policy to allow authenticated users (admin) to manage posts
-- Assuming simple auth, we allow all authenticated users to full access for now
-- You can refine this if you have specific admin roles
create policy "Admins can manage posts"
  on posts for all
  using (auth.role() = 'authenticated');

-- Create storage bucket for blog images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Storage policies for blog-images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'blog-images' );

create policy "Auth Upload"
  on storage.objects for insert
  with check ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );

create policy "Auth Update"
  on storage.objects for update
  using ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );

create policy "Auth Delete"
  on storage.objects for delete
  using ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );
