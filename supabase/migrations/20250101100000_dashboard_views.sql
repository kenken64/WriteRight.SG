-- Dashboard views for analytics queries

-- Student score trend: scores over time
CREATE OR REPLACE VIEW student_score_trend AS
SELECT
  a.student_id,
  s.id AS submission_id,
  e.total_score,
  e.band,
  e.essay_type,
  e.dimension_scores,
  e.created_at AS evaluated_at,
  ROW_NUMBER() OVER (PARTITION BY a.student_id ORDER BY e.created_at) AS submission_number
FROM evaluations e
JOIN submissions s ON s.id = e.submission_id
JOIN assignments a ON a.id = s.assignment_id
WHERE s.status = 'evaluated';

-- Student error categories: aggregate weaknesses by category
CREATE OR REPLACE VIEW student_error_categories AS
SELECT
  a.student_id,
  d.value->>'name' AS dimension_name,
  COUNT(*) AS total_evaluations,
  ROUND(AVG((d.value->>'score')::numeric), 1) AS avg_score,
  ROUND(AVG((d.value->>'maxScore')::numeric), 1) AS max_score,
  ROUND(AVG((d.value->>'score')::numeric / NULLIF((d.value->>'maxScore')::numeric, 0) * 100), 1) AS avg_percent
FROM evaluations e
JOIN submissions s ON s.id = e.submission_id
JOIN assignments a ON a.id = s.assignment_id,
LATERAL jsonb_array_elements(e.dimension_scores::jsonb) AS d(value)
WHERE s.status = 'evaluated'
GROUP BY a.student_id, d.value->>'name';

-- Parent promise stats: fulfilment tracking per parent
CREATE OR REPLACE VIEW parent_promise_stats AS
SELECT
  r.parent_id,
  COUNT(*) AS total_redemptions,
  COUNT(*) FILTER (WHERE r.status = 'completed') AS fulfilled_count,
  COUNT(*) FILTER (WHERE r.status = 'overdue') AS overdue_count,
  COUNT(*) FILTER (WHERE r.status IN ('claimed', 'acknowledged', 'pending_fulfilment')) AS pending_count,
  COUNT(*) FILTER (WHERE r.status = 'withdrawn') AS withdrawn_count,
  ROUND(
    COUNT(*) FILTER (WHERE r.status = 'completed')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE r.status IN ('completed', 'overdue', 'withdrawn')), 0) * 100,
    1
  ) AS fulfilment_rate,
  AVG(
    CASE WHEN r.fulfilled_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (r.fulfilled_at::timestamp - r.claimed_at::timestamp)) / 86400
    ELSE NULL END
  )::numeric(5,1) AS avg_days_to_fulfil
FROM redemptions r
GROUP BY r.parent_id;

-- Student submission streak: current and historical
CREATE OR REPLACE VIEW student_submission_streak AS
SELECT
  ss.student_id,
  ss.current_streak,
  ss.longest_streak,
  ss.last_submission_date,
  CASE
    WHEN ss.last_submission_date = CURRENT_DATE THEN true
    WHEN ss.last_submission_date = CURRENT_DATE - INTERVAL '1 day' THEN true
    ELSE false
  END AS streak_active,
  sp.display_name AS student_name
FROM student_streaks ss
JOIN student_profiles sp ON sp.id = ss.student_id;

-- Student achievement summary: counts by category
CREATE OR REPLACE VIEW student_achievement_summary AS
SELECT
  sa.student_id,
  a.category,
  COUNT(*) AS unlocked_count,
  (SELECT COUNT(*) FROM achievements WHERE category = a.category) AS total_in_category,
  ROUND(
    COUNT(*)::numeric /
    NULLIF((SELECT COUNT(*) FROM achievements WHERE category = a.category), 0) * 100,
    1
  ) AS completion_percent,
  MAX(sa.unlocked_at) AS latest_unlock
FROM student_achievements sa
JOIN achievements a ON a.id = sa.achievement_id
GROUP BY sa.student_id, a.category;
