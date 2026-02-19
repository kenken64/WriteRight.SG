-- Teacher class codes: a shareable code that students use to link with a teacher

CREATE TABLE class_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  class_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Only one active code per teacher
CREATE UNIQUE INDEX idx_class_codes_active_teacher ON class_codes(teacher_id) WHERE is_active = true;
CREATE INDEX idx_class_codes_code ON class_codes(code);

ALTER TABLE class_codes ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own codes
CREATE POLICY "Teachers see own class codes" ON class_codes FOR SELECT
  USING (teacher_id = auth.uid());

-- Teachers can insert their own codes
CREATE POLICY "Teachers can create own class codes" ON class_codes FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- Teachers can update their own codes
CREATE POLICY "Teachers can update own class codes" ON class_codes FOR UPDATE
  USING (teacher_id = auth.uid());

-- Teachers can delete their own codes
CREATE POLICY "Teachers can delete own class codes" ON class_codes FOR DELETE
  USING (teacher_id = auth.uid());

-- Any authenticated user can look up active codes (for students joining a class)
CREATE POLICY "Authenticated users can lookup active class codes" ON class_codes FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Allow students to INSERT parent_student_links to join a teacher's class
-- Uses the get_my_student_profile_ids() helper from 20250226300000_fix_rls_recursion.sql
CREATE POLICY "Students can link to teachers via class code" ON parent_student_links FOR INSERT
  WITH CHECK (student_id IN (SELECT get_my_student_profile_ids()));
