-- Add SEO columns to posts table
alter table posts 
add column if not exists meta_title text,
add column if not exists meta_description text,
add column if not exists focus_keyword text,
add column if not exists alt_text text,
add column if not exists category text default 'Dicas',
add column if not exists tags text[],
add column if not exists is_featured boolean default false;

-- Add comment to columns for clarity
comment on column posts.meta_title is 'Title for Google Search (Max 60 chars)';
comment on column posts.meta_description is 'Description for Google Search (Max 160 chars)';
comment on column posts.focus_keyword is 'Main keyword for SEO analysis';
