-- Fix: Allow authenticated users to insert their own row in users table
-- ensureUserRow() needs this during onboarding (both parent skip and link flows)

DROP POLICY IF EXISTS "Users can insert own record" ON users;
CREATE POLICY "Users can insert own record"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
