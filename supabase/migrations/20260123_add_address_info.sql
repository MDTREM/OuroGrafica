-- Add address_info column as JSONB to store full address details
alter table public.orders add column if not exists address_info jsonb default '{}'::jsonb;
