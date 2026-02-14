-- 003: Submissions and OCR

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  image_refs TEXT[],
  ocr_text TEXT,
  ocr_confidence FLOAT,
  ocr_model_version TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'uploading', 'processing', 'ocr_complete',
    'evaluating', 'evaluated', 'failed'
  )),
  failure_reason TEXT,
  word_count INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created ON submissions(created_at DESC);

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
