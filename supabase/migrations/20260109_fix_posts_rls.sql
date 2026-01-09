-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for Public Read Access
CREATE POLICY "Public posts are viewable by everyone" 
ON posts FOR SELECT 
USING (published = true);

-- Be careful with Admin Preview (we might want admin to see unpublished posts)
-- So we add another policy or adjust the above. 
-- Actually, let's allow "Select" for everyone, and filter by "published" in the application query for public views.
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts;

CREATE POLICY "everyone_can_select_posts" 
ON posts FOR SELECT 
USING (true);

-- Policy for Authenticated Users (Admins) to Insert/Update/Delete
-- Assuming simply being authenticated is enough for this app context. 
-- If we had a "role" column in profiles, we would check that.
-- For now, allow all authenticated users (service role or logged in).

CREATE POLICY "Authenticated users can insert posts" 
ON posts FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts" 
ON posts FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete posts" 
ON posts FOR DELETE 
TO authenticated 
USING (true);
