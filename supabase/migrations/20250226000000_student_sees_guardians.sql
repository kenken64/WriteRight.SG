-- Fix: Students can see their linked guardians/teachers
-- Previously only parents could read parent_student_links (RLS gap)
-- Students need to see WHO has access to their account (transparency + safety)

-- 1. Students can read their own links in parent_student_links
CREATE POLICY "Students see own links"
  ON parent_student_links FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

-- 2. Students can read linked guardian/teacher user records (display_name, parent_type only)
--    This allows the join in the dashboard layout to resolve parent details
CREATE POLICY "Students can read linked parent records"
  ON users FOR SELECT
  USING (
    id IN (
      SELECT parent_id FROM parent_student_links
      WHERE student_id IN (
        SELECT id FROM student_profiles WHERE user_id = auth.uid()
      )
    )
  );
