-- Add payment_method column
alter table public.orders add column if not exists payment_method text;

-- Optional: Backfill existing Pix orders (if they have txid)
update public.orders set payment_method = 'pix' where txid is not null and payment_method is null;
