-- 010: Essay Editor tables
-- essay_drafts, draft_versions, ai_interactions, grammar_annotations, live_scores

CREATE TABLE essay_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id),
  content TEXT,
  plain_text TEXT,
  word_count INT DEFAULT 0,
  outline JSONB,
  writing_mode TEXT DEFAULT 'practice' CHECK (writing_mode IN ('practice', 'timed', 'exam')),
  timer_duration_min INT,
  timer_started_at TIMESTAMPTZ,
  ai_assistant_enabled BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'writing' CHECK (status IN ('writing', 'paused', 'submitted', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE draft_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES essay_drafts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  word_count INT,
  version_number INT NOT NULL,
  auto_saved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES essay_drafts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'suggestion', 'grammar_fix', 'vocabulary_hint',
    'structure_hint', 'student_question', 'coach_response'
  )),
  trigger TEXT,
  content TEXT NOT NULL,
  student_text_context TEXT,
  accepted BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE grammar_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES essay_drafts(id) ON DELETE CASCADE,
  offset_start INT NOT NULL,
  offset_end INT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('grammar', 'spelling', 'vocabulary', 'style', 'passive_voice')),
  original_text TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  explanation TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE live_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES essay_drafts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id),
  paragraph_count INT NOT NULL,
  total_score INT NOT NULL,
  band INT NOT NULL,
  dimension_scores JSONB NOT NULL,
  next_band_tips JSONB,
  rubric_version TEXT NOT NULL,
  model_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_essay_drafts_student ON essay_drafts(student_id);
CREATE INDEX idx_essay_drafts_assignment ON essay_drafts(assignment_id);
CREATE INDEX idx_draft_versions_draft ON draft_versions(draft_id);
CREATE INDEX idx_ai_interactions_draft ON ai_interactions(draft_id);
CREATE INDEX idx_grammar_annotations_draft ON grammar_annotations(draft_id);
CREATE INDEX idx_live_scores_draft ON live_scores(draft_id);

-- RLS
ALTER TABLE essay_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_scores ENABLE ROW LEVEL SECURITY;

-- Students see own drafts
CREATE POLICY "Students see own drafts"
  ON essay_drafts FOR ALL
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

-- Students see own draft versions
CREATE POLICY "Students see own draft versions"
  ON draft_versions FOR ALL
  USING (draft_id IN (
    SELECT id FROM essay_drafts WHERE student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  ));

-- Students see own AI interactions
CREATE POLICY "Students see own ai interactions"
  ON ai_interactions FOR ALL
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

-- Students see own grammar annotations
CREATE POLICY "Students see own grammar annotations"
  ON grammar_annotations FOR ALL
  USING (draft_id IN (
    SELECT id FROM essay_drafts WHERE student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  ));

-- Students see own live scores
CREATE POLICY "Students see own live scores"
  ON live_scores FOR SELECT
  USING (student_id IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

-- Parents see linked student drafts (read only)
CREATE POLICY "Parents see linked student drafts"
  ON essay_drafts FOR SELECT
  USING (student_id IN (
    SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
  ));

-- Parents see AI interaction logs
CREATE POLICY "Parents see AI interaction logs"
  ON ai_interactions FOR SELECT
  USING (student_id IN (
    SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
  ));

-- Parents see live scores
CREATE POLICY "Parents see linked student live scores"
  ON live_scores FOR SELECT
  USING (student_id IN (
    SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
  ));
