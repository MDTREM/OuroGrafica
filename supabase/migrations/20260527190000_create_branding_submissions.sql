-- Create branding_submissions table
create table if not exists branding_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  store_name text not null,
  email text not null,
  cnpj text,
  whatsapp text not null,
  orders_per_day text not null,
  monthly_revenue text not null,
  niche text not null,
  brand_details text,
  selected_plan text,
  status text default 'pending' not null, -- 'pending', 'contacted', 'completed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table branding_submissions enable row level security;

-- Drop existing policies if they exist to avoid duplicate errors during execution
drop policy if exists "Anyone can insert branding submissions" on branding_submissions;
drop policy if exists "Admins can view and manage branding submissions" on branding_submissions;

-- Policy to allow anonymous submissions (anyone can fill out the form)
create policy "Anyone can insert branding submissions"
  on branding_submissions for insert
  with check (true);

-- Policy to allow authenticated users (admin) to read and manage submissions
create policy "Admins can view and manage branding submissions"
  on branding_submissions for all
  using (auth.role() = 'authenticated');
