import { describe, it, expect } from 'vitest';
import {
  userSchema, studentProfileSchema, topicSchema, assignmentSchema,
  submissionSchema, evaluationSchema, rewriteSchema, achievementSchema,
  studentAchievementSchema, studentStreakSchema,
  wishlistItemSchema, redemptionSchema, subscriptionSchema,
  createAssignmentSchema, generateTopicRequestSchema,
  evaluateRequestSchema, rewriteRequestSchema,
} from '@/lib/validators/schemas';

const UUID = '550e8400-e29b-41d4-a716-446655440000';
const UUID2 = '550e8400-e29b-41d4-a716-446655440001';

describe('topicSchema', () => {
  const valid = {
    id: UUID, source: 'trending', source_text: null,
    category: 'technology', essay_type: 'continuous',
    level: 'sec4', generated_prompts: null, created_at: '2024-01-01T00:00:00Z',
  };

  it('accepts valid topic', () => {
    expect(topicSchema.parse(valid)).toEqual(valid);
  });

  it('rejects invalid source', () => {
    expect(() => topicSchema.parse({ ...valid, source: 'ai' })).toThrow();
  });

  it('rejects invalid category', () => {
    expect(() => topicSchema.parse({ ...valid, category: 'sports' })).toThrow();
  });
});

describe('assignmentSchema', () => {
  const valid = {
    id: UUID, student_id: UUID2, topic_id: null,
    essay_type: 'situational', essay_sub_type: 'letter',
    prompt: 'Write a formal letter to the editor',
    guiding_points: null, word_count_min: 200, word_count_max: 400,
    language: 'en', created_at: '2024-01-01T00:00:00Z',
  };

  it('accepts valid assignment', () => {
    expect(assignmentSchema.parse(valid)).toEqual(valid);
  });

  it('rejects invalid essay_type', () => {
    expect(() => assignmentSchema.parse({ ...valid, essay_type: 'poetry' })).toThrow();
  });

  it('rejects short prompt', () => {
    expect(() => assignmentSchema.parse({ ...valid, prompt: 'Hi' })).toThrow();
  });
});

describe('rewriteSchema', () => {
  it('accepts valid rewrite', () => {
    expect(rewriteSchema.parse({
      id: UUID, submission_id: UUID2, mode: 'exam_optimised',
      rewritten_text: 'Better text', diff_payload: {}, rationale: {},
      target_band: 4, created_at: '2024-01-01T00:00:00Z',
    })).toBeDefined();
  });

  it('rejects invalid mode', () => {
    expect(() => rewriteSchema.parse({
      id: UUID, submission_id: UUID2, mode: 'fast',
      rewritten_text: 'x', diff_payload: {}, rationale: {},
      target_band: 4, created_at: '2024-01-01T00:00:00Z',
    })).toThrow();
  });
});

describe('achievementSchema', () => {
  it('accepts valid achievement', () => {
    expect(achievementSchema.parse({
      id: UUID, code: 'FIRST_SUBMIT', name: 'First Steps',
      description: 'Submit your first essay', category: 'practice',
      badge_emoji: '🎯', criteria: {}, sort_order: 1,
    })).toBeDefined();
  });

  it('rejects invalid category', () => {
    expect(() => achievementSchema.parse({
      id: UUID, code: 'X', name: 'X', description: 'X',
      category: 'unknown', badge_emoji: '🎯', criteria: {}, sort_order: 1,
    })).toThrow();
  });
});

describe('studentStreakSchema', () => {
  it('accepts valid streak', () => {
    expect(studentStreakSchema.parse({
      student_id: UUID, current_streak: 5, longest_streak: 10, last_submission_date: '2024-06-15',
    })).toBeDefined();
  });

  it('accepts null last_submission_date', () => {
    expect(studentStreakSchema.parse({
      student_id: UUID, current_streak: 0, longest_streak: 0, last_submission_date: null,
    })).toBeDefined();
  });
});

describe('redemptionSchema', () => {
  const valid = {
    id: UUID, wishlist_item_id: UUID2, student_id: UUID, parent_id: UUID2,
    achievement_id: UUID, status: 'claimed', fulfilment_deadline: '2024-07-01T00:00:00Z',
    kid_confirmed: false, claimed_at: '2024-06-15T00:00:00Z',
    fulfilled_at: null, created_at: '2024-06-15T00:00:00Z',
  };

  it('accepts valid redemption', () => {
    expect(redemptionSchema.parse(valid)).toEqual(valid);
  });

  it('accepts all valid statuses', () => {
    const statuses = ['claimed', 'acknowledged', 'pending_fulfilment', 'completed', 'overdue', 'rescheduled', 'withdrawn'];
    for (const s of statuses) {
      expect(() => redemptionSchema.parse({ ...valid, status: s })).not.toThrow();
    }
  });

  it('rejects invalid status', () => {
    expect(() => redemptionSchema.parse({ ...valid, status: 'expired' })).toThrow();
  });
});

describe('subscriptionSchema', () => {
  it('accepts valid subscription', () => {
    expect(subscriptionSchema.parse({
      id: UUID, user_id: UUID2, plan: 'plus_monthly',
      status: 'active', current_period_end: '2024-12-31',
    })).toBeDefined();
  });

  it('rejects invalid plan', () => {
    expect(() => subscriptionSchema.parse({
      id: UUID, user_id: UUID2, plan: 'enterprise',
      status: 'active', current_period_end: null,
    })).toThrow();
  });
});

describe('evaluateRequestSchema', () => {
  it('accepts valid UUID', () => {
    expect(evaluateRequestSchema.parse({ submissionId: UUID })).toBeDefined();
  });

  it('rejects non-UUID', () => {
    expect(() => evaluateRequestSchema.parse({ submissionId: 'not-uuid' })).toThrow();
  });
});

describe('rewriteRequestSchema', () => {
  it('accepts valid request', () => {
    expect(rewriteRequestSchema.parse({ submissionId: UUID, mode: 'clarity_optimised' })).toBeDefined();
  });

  it('rejects invalid mode', () => {
    expect(() => rewriteRequestSchema.parse({ submissionId: UUID, mode: 'fast' })).toThrow();
  });
});
