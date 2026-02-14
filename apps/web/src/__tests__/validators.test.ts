import { describe, it, expect } from 'vitest';
import {
  userSchema, studentProfileSchema, topicSchema, assignmentSchema,
  submissionSchema, evaluationSchema, rewriteSchema, achievementSchema,
  wishlistItemSchema, redemptionSchema, subscriptionSchema,
  createAssignmentSchema, generateTopicRequestSchema,
} from '@/lib/validators/schemas';

describe('userSchema', () => {
  const validUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    role: 'parent',
    email: 'test@example.com',
    mobile: null,
    display_name: 'Test User',
    notification_prefs: { email: true, push: false },
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
  };

  it('accepts valid user', () => {
    expect(userSchema.parse(validUser)).toEqual(validUser);
  });

  it('rejects invalid role', () => {
    expect(() => userSchema.parse({ ...validUser, role: 'admin' })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => userSchema.parse({ ...validUser, email: 'notanemail' })).toThrow();
  });

  it('rejects invalid status', () => {
    expect(() => userSchema.parse({ ...validUser, status: 'banned' })).toThrow();
  });
});

describe('studentProfileSchema', () => {
  it('accepts valid profile', () => {
    const profile = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      display_name: 'Alex',
      level: 'sec3',
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(studentProfileSchema.parse(profile)).toEqual(profile);
  });

  it('rejects invalid level', () => {
    expect(() => studentProfileSchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      display_name: 'Alex',
      level: 'sec6',
      created_at: '2024-01-01T00:00:00Z',
    })).toThrow();
  });
});

describe('submissionSchema', () => {
  const validSubmission = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    assignment_id: '550e8400-e29b-41d4-a716-446655440001',
    image_refs: ['img1.jpg'],
    ocr_text: 'Hello world',
    ocr_confidence: 0.95,
    status: 'evaluated',
    failure_reason: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  it('accepts valid submission', () => {
    expect(submissionSchema.parse(validSubmission)).toEqual(validSubmission);
  });

  it('accepts all valid statuses', () => {
    const statuses = ['draft', 'uploading', 'processing', 'ocr_complete', 'evaluating', 'evaluated', 'failed'];
    for (const status of statuses) {
      expect(() => submissionSchema.parse({ ...validSubmission, status })).not.toThrow();
    }
  });
});

describe('evaluationSchema', () => {
  const validEval = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    submission_id: '550e8400-e29b-41d4-a716-446655440001',
    essay_type: 'continuous',
    rubric_version: 'v1',
    model_id: 'gpt-4o',
    prompt_version: 'v1',
    dimension_scores: [{ name: 'Content', score: 4, maxScore: 6, band: 4, justification: 'Good content' }],
    total_score: 20,
    band: 4,
    strengths: [{ text: 'Good', quote: 'example' }],
    weaknesses: [{ text: 'Improve', quote: 'example', suggestion: 'Do this' }],
    next_steps: ['Practice more'],
    confidence: 0.9,
    review_recommended: false,
    created_at: '2024-01-01T00:00:00Z',
  };

  it('accepts valid evaluation', () => {
    expect(evaluationSchema.parse(validEval)).toEqual(validEval);
  });

  it('rejects score > 30', () => {
    expect(() => evaluationSchema.parse({ ...validEval, total_score: 31 })).toThrow();
  });

  it('rejects band > 5', () => {
    expect(() => evaluationSchema.parse({ ...validEval, band: 6 })).toThrow();
  });
});

describe('wishlistItemSchema', () => {
  it('accepts all reward types', () => {
    const types = ['treat', 'screen_time', 'book', 'activity', 'money', 'creative', 'custom'];
    for (const t of types) {
      expect(() => wishlistItemSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        student_id: '550e8400-e29b-41d4-a716-446655440001',
        created_by: 'student',
        title: 'Test',
        description: null,
        image_url: null,
        reward_type: t,
        required_achievement_id: null,
        is_surprise: false,
        status: 'locked',
        claimed_at: null,
        fulfilled_at: null,
        created_at: '2024-01-01T00:00:00Z',
      })).not.toThrow();
    }
  });
});

describe('createAssignmentSchema', () => {
  it('accepts valid create request', () => {
    const input = {
      student_id: '550e8400-e29b-41d4-a716-446655440000',
      essay_type: 'situational',
      essay_sub_type: 'letter',
      prompt: 'Write a formal letter to the editor...',
      word_count_min: 200,
      word_count_max: 400,
    };
    expect(createAssignmentSchema.parse(input)).toBeDefined();
  });

  it('rejects prompt shorter than 10 chars', () => {
    expect(() => createAssignmentSchema.parse({
      student_id: '550e8400-e29b-41d4-a716-446655440000',
      essay_type: 'situational',
      essay_sub_type: 'letter',
      prompt: 'Short',
      word_count_min: 200,
      word_count_max: 400,
    })).toThrow();
  });
});

describe('generateTopicRequestSchema', () => {
  it('accepts trending request', () => {
    expect(generateTopicRequestSchema.parse({
      source: 'trending',
      essayType: 'continuous',
    })).toBeDefined();
  });

  it('accepts upload request with article', () => {
    expect(generateTopicRequestSchema.parse({
      source: 'upload',
      essayType: 'situational',
      articleText: 'Some article content...',
    })).toBeDefined();
  });
});
