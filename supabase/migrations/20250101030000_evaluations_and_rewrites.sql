-- 004: Evaluations, Rewrites, and Rechecks

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  essay_type TEXT NOT NULL,
  rubric_version TEXT NOT NULL,
  model_id TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  dimension_scores JSONB NOT NULL,
  total_score INT NOT NULL CHECK (total_score >= 0 AND total_score <= 30),
  band INT NOT NULL CHECK (band >= 0 AND band <= 5),
  strengths JSONB NOT NULL,
  weaknesses JSONB NOT NULL,
  next_steps JSONB NOT NULL,
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  review_recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rewrites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('exam_optimised', 'clarity_optimised')),
  rewritten_text TEXT NOT NULL,
  diff_payload JSONB,
  rationale JSONB,
  target_band INT CHECK (target_band >= 1 AND target_band <= 5),
  model_id TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rechecks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id),
  original_evaluation_id UUID NOT NULL REFERENCES evaluations(id),
  new_evaluation_id UUID REFERENCES evaluations(id),
  score_delta INT,
  escalated BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'escalated')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE rubric_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_type TEXT NOT NULL CHECK (essay_type IN ('situational', 'continuous')),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  criteria JSONB NOT NULL,
  band_descriptors JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (essay_type, version)
);

CREATE INDEX idx_evaluations_submission ON evaluations(submission_id);
CREATE INDEX idx_rewrites_submission ON rewrites(submission_id);
CREATE INDEX idx_rechecks_submission ON rechecks(submission_id);
CREATE INDEX idx_rubric_templates_type ON rubric_templates(essay_type, active);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewrites ENABLE ROW LEVEL SECURITY;
ALTER TABLE rechecks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_templates ENABLE ROW LEVEL SECURITY;
