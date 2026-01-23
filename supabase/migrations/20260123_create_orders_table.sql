-- Create enum for order status
create type order_status as enum ('pending', 'paid', 'cancelled', 'failed');

-- Create orders table
create table public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete set null,
  
  -- PIX/Payment Info
  txid text, -- Efí Transaction ID
  qr_code text, -- Copy Paste code
  qr_code_image text, -- Base64 image url
  
  -- Order Details
  total numeric(10, 2) not null,
  items jsonb not null, -- Snapshot of items bought
  
  -- Customer Info (Snapshot in case user profile changes)
  customer_name text,
  customer_document text, -- CPF/CNPJ
  customer_email text,
  
  status order_status default 'pending',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint orders_pkey primary key (id)
);

-- RLS Policies
alter table public.orders enable row level security;

-- Users can view their own orders
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

-- Users can insert their own orders (via server action ideally, but allowing for now)
create policy "Users can insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id);
