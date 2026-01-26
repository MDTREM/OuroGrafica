alter table products add column if not exists price_breakdowns jsonb default '{}';
