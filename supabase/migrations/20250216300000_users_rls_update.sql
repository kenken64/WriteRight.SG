-- Allow users to read their own row
CREATE POLICY "Users can read own record" ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own row
CREATE POLICY "Users can update own record" ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
