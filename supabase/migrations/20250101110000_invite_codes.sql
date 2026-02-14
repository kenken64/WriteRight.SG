-- 012: Onboarding flag & Invite Codes

ALTER TABLE users ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);

-- Only one active code per student
CREATE UNIQUE INDEX idx_invite_codes_active_student ON invite_codes(student_id) WHERE is_active = true;
CREATE INDEX idx_invite_codes_code ON invite_codes(code);

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own row (needed during onboarding since no DB trigger creates it)
CREATE POLICY "Users can insert own record" ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Students see their own codes
CREATE POLICY "Students see own invite codes" ON invite_codes FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- Students can create their own codes
CREATE POLICY "Students can create own invite codes" ON invite_codes FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- Students can update their own codes
CREATE POLICY "Students can update own invite codes" ON invite_codes FOR UPDATE
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- Authenticated users can look up active codes (for parents during onboarding)
CREATE POLICY "Authenticated users can lookup active codes" ON invite_codes FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);
