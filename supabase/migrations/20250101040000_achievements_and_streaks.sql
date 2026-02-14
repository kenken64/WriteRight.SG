-- 005: Achievements, Streaks, and Progress

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'practice', 'improvement', 'mastery', 'streak', 'special'
  )),
  badge_emoji TEXT NOT NULL,
  criteria JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  submission_id UUID REFERENCES submissions(id),
  UNIQUE (student_id, achievement_id)
);

CREATE TABLE student_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_submission_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  current_value INT DEFAULT 0,
  target_value INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, achievement_id)
);

CREATE INDEX idx_student_achievements_student ON student_achievements(student_id);
CREATE INDEX idx_student_achievements_achievement ON student_achievements(achievement_id);
CREATE INDEX idx_student_streaks_student ON student_streaks(student_id);
CREATE INDEX idx_achievement_progress_student ON achievement_progress(student_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- Seed default achievements
INSERT INTO achievements (code, name, description, category, badge_emoji, criteria, sort_order) VALUES
  ('first_steps', 'First Steps', 'Complete first submission', 'practice', '🐣', '{"type": "submission_count", "target": 1}', 1),
  ('getting_started', 'Getting Started', 'Complete 5 submissions', 'practice', '✏️', '{"type": "submission_count", "target": 5}', 2),
  ('dedicated_writer', 'Dedicated Writer', 'Complete 20 submissions', 'practice', '📝', '{"type": "submission_count", "target": 20}', 3),
  ('writing_machine', 'Writing Machine', 'Complete 50 submissions', 'practice', '⚡', '{"type": "submission_count", "target": 50}', 4),
  ('century_club', 'Century Club', 'Complete 100 submissions', 'practice', '💯', '{"type": "submission_count", "target": 100}', 5),
  ('levelling_up', 'Levelling Up', 'Improve total score by 3+ marks over 5 submissions', 'improvement', '📈', '{"type": "score_improvement", "delta": 3, "window": 5}', 10),
  ('band_breaker', 'Band Breaker', 'Move up one band', 'improvement', '🎯', '{"type": "band_increase", "delta": 1}', 11),
  ('grammar_hero', 'Grammar Hero', 'Reduce language errors by 50% over 10 submissions', 'improvement', '🛡️', '{"type": "error_reduction", "percent": 50, "window": 10}', 12),
  ('vocab_explorer', 'Vocab Explorer', 'Use 10+ new vocabulary words', 'improvement', '📚', '{"type": "vocab_growth", "target": 10}', 13),
  ('consistency_king', 'Consistency King', 'Submit weekly for 4 consecutive weeks', 'improvement', '👑', '{"type": "weekly_streak", "target": 4}', 14),
  ('band_3_unlocked', 'Band 3 Unlocked', 'Score Band 3 for the first time', 'mastery', '🥉', '{"type": "band_reached", "band": 3}', 20),
  ('band_4_unlocked', 'Band 4 Unlocked', 'Score Band 4 for the first time', 'mastery', '🥈', '{"type": "band_reached", "band": 4}', 21),
  ('band_5_unlocked', 'Band 5 Unlocked', 'Score Band 5 for the first time', 'mastery', '🥇', '{"type": "band_reached", "band": 5}', 22),
  ('perfect_language', 'Perfect Language', 'Score 18+ out of 20 on Language', 'mastery', '✨', '{"type": "dimension_score", "dimension": "language", "min_score": 18}', 23),
  ('task_master', 'Task Master', 'Score 9+ out of 10 on Task Fulfilment', 'mastery', '🎯', '{"type": "dimension_score", "dimension": "task_fulfilment", "min_score": 9}', 24),
  ('streak_3', '3-Day Streak', 'Submit 3 days in a row', 'streak', '🔥', '{"type": "streak", "target": 3}', 30),
  ('streak_7', '7-Day Streak', 'Submit 7 days in a row', 'streak', '🔥🔥', '{"type": "streak", "target": 7}', 31),
  ('streak_30', '30-Day Streak', 'Submit 30 days in a row', 'streak', '🔥🔥🔥', '{"type": "streak", "target": 30}', 32),
  ('comeback_kid', 'Comeback Kid', 'Return after 14+ day gap', 'streak', '💪', '{"type": "comeback", "gap_days": 14}', 33),
  ('self_corrector', 'Self-Corrector', 'Use manual OCR correction 5 times', 'special', '🔍', '{"type": "ocr_correction_count", "target": 5}', 40),
  ('reflective_writer', 'Reflective Writer', 'Complete reflection before rewrite 10 times', 'special', '🪞', '{"type": "reflection_count", "target": 10}', 41),
  ('topic_explorer', 'Topic Explorer', 'Complete essays across 5+ categories', 'special', '🌍', '{"type": "category_count", "target": 5}', 42),
  ('all_rounder', 'All-Rounder', 'Score Band 4+ in both essay types', 'special', '🎓', '{"type": "all_round_band", "min_band": 4}', 43);
