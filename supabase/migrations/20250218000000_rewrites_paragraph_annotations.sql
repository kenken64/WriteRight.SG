-- Add paragraph_annotations JSONB column to rewrites table
-- Stores per-paragraph coaching feedback explaining why each part of the
-- rewrite helps push the band score up.

ALTER TABLE rewrites
  ADD COLUMN IF NOT EXISTS paragraph_annotations JSONB;
