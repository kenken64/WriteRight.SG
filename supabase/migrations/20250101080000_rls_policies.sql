-- 009: Row Level Security Policies

-- ============================================================
-- USERS
-- ============================================================
CREATE POLICY "Users can read own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- STUDENT PROFILES
-- ============================================================
CREATE POLICY "Students see own profile"
  ON student_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Parents see linked student profiles"
  ON student_profiles FOR SELECT
  USING (
    id IN (
      SELECT student_id FROM parent_student_links
      WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can create student profiles"
  ON student_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own student profile"
  ON student_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- PARENT-STUDENT LINKS
-- ============================================================
CREATE POLICY "Parents see own links"
  ON parent_student_links FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can create links"
  ON parent_student_links FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- ============================================================
-- TOPICS
-- ============================================================
CREATE POLICY "Anyone can read topics"
  ON topics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create topics"
  ON topics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
CREATE POLICY "Students see own assignments"
  ON assignments FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student assignments"
  ON assignments FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create assignments for linked students"
  ON assignments FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE POLICY "Students see own submissions"
  ON submissions FOR SELECT
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student submissions"
  ON submissions FOR SELECT
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      WHERE a.student_id IN (
        SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own submissions"
  ON submissions FOR UPDATE
  USING (
    assignment_id IN (
      SELECT a.id FROM assignments a
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

-- ============================================================
-- EVALUATIONS
-- ============================================================
CREATE POLICY "Students see own evaluations"
  ON evaluations FOR SELECT
  USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student evaluations"
  ON evaluations FOR SELECT
  USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.student_id IN (
        SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
      )
    )
  );

-- ============================================================
-- REWRITES
-- ============================================================
CREATE POLICY "Students see own rewrites"
  ON rewrites FOR SELECT
  USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student rewrites"
  ON rewrites FOR SELECT
  USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.student_id IN (
        SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
      )
    )
  );

-- ============================================================
-- RECHECKS
-- ============================================================
CREATE POLICY "Users see own rechecks"
  ON rechecks FOR SELECT
  USING (
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN student_profiles sp ON a.student_id = sp.id
      WHERE sp.user_id = auth.uid()
    )
    OR
    submission_id IN (
      SELECT s.id FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE a.student_id IN (
        SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
      )
    )
  );

-- ============================================================
-- RUBRIC TEMPLATES (public read)
-- ============================================================
CREATE POLICY "Anyone can read active rubric templates"
  ON rubric_templates FOR SELECT
  USING (active = true);

-- ============================================================
-- ACHIEVEMENTS (public read)
-- ============================================================
CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  USING (true);

-- ============================================================
-- STUDENT ACHIEVEMENTS
-- ============================================================
CREATE POLICY "Students see own achievements"
  ON student_achievements FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student achievements"
  ON student_achievements FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- STUDENT STREAKS
-- ============================================================
CREATE POLICY "Students see own streaks"
  ON student_streaks FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student streaks"
  ON student_streaks FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- ACHIEVEMENT PROGRESS
-- ============================================================
CREATE POLICY "Students see own progress"
  ON achievement_progress FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student progress"
  ON achievement_progress FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- WISHLIST ITEMS
-- ============================================================
CREATE POLICY "Students see own wishlist (non-surprise)"
  ON wishlist_items FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
    AND (is_surprise = false OR status IN ('claimable', 'claimed', 'fulfilled'))
  );

CREATE POLICY "Parents see linked student wishlist"
  ON wishlist_items FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can add wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
    AND created_by = 'student'
  );

CREATE POLICY "Parents can manage linked student wishlist"
  ON wishlist_items FOR ALL
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_links WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- REDEMPTIONS
-- ============================================================
CREATE POLICY "Students see own redemptions"
  ON redemptions FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Parents see linked student redemptions"
  ON redemptions FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can manage redemptions"
  ON redemptions FOR UPDATE
  USING (parent_id = auth.uid());

-- ============================================================
-- KID NUDGES
-- ============================================================
CREATE POLICY "Students can create nudges"
  ON kid_nudges FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users see relevant nudges"
  ON kid_nudges FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM student_profiles WHERE user_id = auth.uid()
    )
    OR
    redemption_id IN (
      SELECT id FROM redemptions WHERE parent_id = auth.uid()
    )
  );

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE POLICY "Users see own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- AUDIT LOGS (admin only, no user access)
-- ============================================================
CREATE POLICY "No direct user access to audit logs"
  ON audit_logs FOR SELECT
  USING (false);

-- ============================================================
-- DASHBOARD VIEWS
-- ============================================================

-- Student score trend over time
CREATE OR REPLACE VIEW student_score_trend AS
SELECT
  sp.id AS student_id,
  sp.user_id,
  e.created_at AS evaluated_at,
  e.total_score,
  e.band,
  e.essay_type,
  e.rubric_version,
  e.confidence
FROM evaluations e
JOIN submissions s ON e.submission_id = s.id
JOIN assignments a ON s.assignment_id = a.id
JOIN student_profiles sp ON a.student_id = sp.id
ORDER BY e.created_at ASC;

-- Student error categories breakdown
CREATE OR REPLACE VIEW student_error_categories AS
SELECT
  sp.id AS student_id,
  sp.user_id,
  e.id AS evaluation_id,
  e.essay_type,
  jsonb_array_elements(e.weaknesses) AS weakness,
  e.created_at
FROM evaluations e
JOIN submissions s ON e.submission_id = s.id
JOIN assignments a ON s.assignment_id = a.id
JOIN student_profiles sp ON a.student_id = sp.id;

-- Parent promise fulfilment stats
CREATE OR REPLACE VIEW parent_promise_stats AS
SELECT
  r.parent_id,
  COUNT(*) AS total_claims,
  COUNT(*) FILTER (WHERE r.status = 'completed') AS fulfilled,
  COUNT(*) FILTER (WHERE r.status = 'completed' AND r.fulfilled_at <= r.fulfilment_deadline) AS fulfilled_on_time,
  COUNT(*) FILTER (WHERE r.status = 'overdue') AS overdue,
  COUNT(*) FILTER (WHERE r.status = 'withdrawn') AS withdrawn,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND(
      COUNT(*) FILTER (WHERE r.status = 'completed' AND r.fulfilled_at <= r.fulfilment_deadline)::numeric
      / COUNT(*)::numeric * 100, 1
    )
    ELSE 100
  END AS promise_score
FROM redemptions r
GROUP BY r.parent_id;
