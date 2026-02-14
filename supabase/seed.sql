-- Seed data for development and testing
-- Note: achievements are seeded in migration 005

-- Sample rubric templates
INSERT INTO rubric_templates (essay_type, name, version, criteria, band_descriptors, active) VALUES
(
  'situational',
  'MOE 1184 Situational Writing',
  '1184-sw-v1',
  '[
    {"name": "Task Fulfilment", "max_score": 10, "description": "Addressing required points, purpose/audience/context"},
    {"name": "Language", "max_score": 20, "description": "Organisation, clarity of expression, accuracy"}
  ]'::jsonb,
  '{
    "task_fulfilment": [
      {"band": 5, "marks": "9-10", "descriptor": "All points addressed and developed in detail"},
      {"band": 4, "marks": "7-8", "descriptor": "All points addressed with one or more developed"},
      {"band": 3, "marks": "5-6", "descriptor": "Most points addressed with some development"},
      {"band": 2, "marks": "3-4", "descriptor": "Some points addressed"},
      {"band": 1, "marks": "1-2", "descriptor": "One point addressed"},
      {"band": 0, "marks": "0", "descriptor": "No creditable response"}
    ],
    "language": [
      {"band": 5, "marks": "17-20", "descriptor": "Coherent and cohesive; effective use of ambitious vocabulary"},
      {"band": 4, "marks": "13-16", "descriptor": "Coherent with some cohesion; varied vocabulary"},
      {"band": 3, "marks": "9-12", "descriptor": "Most ideas coherent; vocabulary varied enough"},
      {"band": 2, "marks": "5-8", "descriptor": "Some ideas coherent; mostly simple vocabulary"},
      {"band": 1, "marks": "1-4", "descriptor": "Ideas in isolation; simple vocabulary"},
      {"band": 0, "marks": "0", "descriptor": "No creditable response"}
    ]
  }'::jsonb,
  true
),
(
  'continuous',
  'MOE 1184 Continuous Writing',
  '1184-cw-v1',
  '[
    {"name": "Content & Development", "max_score": 10, "description": "Relevance, depth, engagement"},
    {"name": "Language & Organisation", "max_score": 20, "description": "Expression, vocabulary, grammar, structure"}
  ]'::jsonb,
  '{
    "content_development": [
      {"band": 5, "marks": "9-10", "descriptor": "Highly relevant, engaging, well-developed"},
      {"band": 4, "marks": "7-8", "descriptor": "Relevant, interesting, adequately developed"},
      {"band": 3, "marks": "5-6", "descriptor": "Mostly relevant, some development"},
      {"band": 2, "marks": "3-4", "descriptor": "Some relevance, limited development"},
      {"band": 1, "marks": "1-2", "descriptor": "Barely relevant, undeveloped"},
      {"band": 0, "marks": "0", "descriptor": "No creditable response"}
    ],
    "language_organisation": [
      {"band": 5, "marks": "17-20", "descriptor": "Coherent, cohesive, ambitious vocabulary, complex grammar"},
      {"band": 4, "marks": "13-16", "descriptor": "Coherent, varied vocabulary and grammar, mostly accurate"},
      {"band": 3, "marks": "9-12", "descriptor": "Most ideas coherent, vocabulary adequate"},
      {"band": 2, "marks": "5-8", "descriptor": "Some coherence, simple vocabulary"},
      {"band": 1, "marks": "1-4", "descriptor": "Fragmented, simple vocabulary"},
      {"band": 0, "marks": "0", "descriptor": "No creditable response"}
    ]
  }'::jsonb,
  true
);
