-- 002: Topics and Assignments

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('upload', 'trending', 'manual')),
  source_text TEXT,
  source_image_refs TEXT[],
  category TEXT CHECK (category IN (
    'environment', 'technology', 'social_issues',
    'education', 'health', 'current_affairs'
  )),
  essay_type TEXT NOT NULL CHECK (essay_type IN ('situational', 'continuous')),
  level TEXT CHECK (level IN ('sec3', 'sec4', 'sec5')),
  generated_prompts JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  essay_type TEXT NOT NULL CHECK (essay_type IN ('situational', 'continuous')),
  essay_sub_type TEXT CHECK (essay_sub_type IN (
    'letter', 'email', 'report', 'speech', 'proposal',
    'narrative', 'expository', 'argumentative', 'descriptive'
  )),
  prompt TEXT NOT NULL,
  guiding_points JSONB,
  word_count_min INT DEFAULT 250,
  word_count_max INT DEFAULT 500,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_topics_type ON topics(essay_type);
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_source ON topics(source);
CREATE INDEX idx_assignments_student ON assignments(student_id);
CREATE INDEX idx_assignments_topic ON assignments(topic_id);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
