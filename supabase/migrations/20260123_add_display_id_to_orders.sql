-- Add display_id column for user-friendly order codes
alter table public.orders add column if not exists display_id text;

-- Create index for faster lookup if we search by this later
create index if not exists idx_orders_display_id on public.orders(display_id);

-- Optional: You might want to backfill existing orders with a slice of their UUID or a generated value
-- update public.orders set display_id = substring(id::text from 1 for 8) where display_id is null;
