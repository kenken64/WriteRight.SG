-- Guided rewrite technique responses for checklist-driven self-guided rewriting

CREATE TYPE guided_technique_key AS ENUM (
  'so_what_chain', 'five_senses_snapshot', 'person_quote_detail',
  'before_during_after', 'contrast_sentence', 'zoom_structure'
);

CREATE TABLE guided_rewrite_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  technique_key   guided_technique_key NOT NULL,
  response_data   JSONB NOT NULL DEFAULT '{}',
  is_complete     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT guided_rewrite_responses_unique UNIQUE (submission_id, student_id, technique_key)
);

CREATE INDEX idx_guided_rewrite_responses_submission ON guided_rewrite_responses(submission_id);
CREATE INDEX idx_guided_rewrite_responses_student ON guided_rewrite_responses(student_id);

CREATE TRIGGER guided_rewrite_responses_updated_at
  BEFORE UPDATE ON guided_rewrite_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE guided_rewrite_responses ENABLE ROW LEVEL SECURITY;

-- Students can see their own responses only
CREATE POLICY "Students see own guided responses"
  ON guided_rewrite_responses FOR SELECT
  USING (student_id IN (SELECT get_my_student_profile_ids()));

-- Students can create their own responses only
CREATE POLICY "Students can create own guided responses"
  ON guided_rewrite_responses FOR INSERT
  WITH CHECK (student_id IN (SELECT get_my_student_profile_ids()));

-- Students can update their own responses only
CREATE POLICY "Students can update own guided responses"
  ON guided_rewrite_responses FOR UPDATE
  USING (student_id IN (SELECT get_my_student_profile_ids()));

-- Students can delete their own responses only
CREATE POLICY "Students can delete own guided responses"
  ON guided_rewrite_responses FOR DELETE
  USING (student_id IN (SELECT get_my_student_profile_ids()));
