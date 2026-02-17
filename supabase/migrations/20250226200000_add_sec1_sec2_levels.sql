-- Add Secondary 1 and Secondary 2 as valid student levels

ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_level_check;
ALTER TABLE student_profiles ADD CONSTRAINT student_profiles_level_check
  CHECK (level IN ('sec1', 'sec2', 'sec3', 'sec4', 'sec5'));
