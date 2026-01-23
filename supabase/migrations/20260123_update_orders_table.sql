-- Add Payment Columns to existing orders table
-- (Safe to run even if columns already exist)

alter table public.orders add column if not exists txid text;
alter table public.orders add column if not exists qr_code text;
alter table public.orders add column if not exists qr_code_image text;

alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_document text;
alter table public.orders add column if not exists customer_email text;

alter table public.orders add column if not exists items jsonb default '[]'::jsonb;
alter table public.orders add column if not exists total numeric(10, 2) default 0;

-- Ensure RLS is enabled
alter table public.orders enable row level security;

-- Re-apply policies (Drop first to avoid conflicts if they exist with same name)
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- If order_status type likely exists, we might need to cast the column if it was text.
-- But usually usually 'status' is text or a specific enum.
-- Let's check status column. If needed we can alter it, but for now let's assume it works or is text.
-- If you want to use the enum, we can try creating it if not exists:

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    create type order_status as enum ('pending', 'paid', 'cancelled', 'failed');
  END IF;
END $$;

-- Optional: Alter column to use enum if it's not already
-- alter table public.orders alter column status type order_status using status::text::order_status;
