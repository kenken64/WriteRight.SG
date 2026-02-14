import { describe, it, expect } from 'vitest';
import { ACHIEVEMENT_RULES, type AchievementContext } from '../achievements/rules';

function makeCtx(overrides: Partial<AchievementContext> = {}): AchievementContext {
  return {
    totalSubmissions: 0,
    totalEvaluations: 0,
    currentStreak: 0,
    longestStreak: 0,
    highestBand: 0,
    averageBand: 0,
    bandHistory: [],
    improvementCount: 0,
    perfectScores: 0,
    essayTypesAttempted: new Set(),
    ...overrides,
  };
}

function findRule(code: string) {
  return ACHIEVEMENT_RULES.find((r) => r.code === code)!;
}

describe('ACHIEVEMENT_RULES', () => {
  it('has unique codes', () => {
    const codes = ACHIEVEMENT_RULES.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all rules have required fields', () => {
    for (const rule of ACHIEVEMENT_RULES) {
      expect(rule.code).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.category).toBeTruthy();
      expect(rule.badgeEmoji).toBeTruthy();
      expect(typeof rule.check).toBe('function');
    }
  });
});

describe('Practice achievements', () => {
  it('FIRST_SUBMIT unlocks at 1 submission', () => {
    const rule = findRule('FIRST_SUBMIT');
    expect(rule.check(makeCtx({ totalSubmissions: 0 }))).toBe(false);
    expect(rule.check(makeCtx({ totalSubmissions: 1 }))).toBe(true);
  });

  it('FIVE_SUBMITS unlocks at 5', () => {
    const rule = findRule('FIVE_SUBMITS');
    expect(rule.check(makeCtx({ totalSubmissions: 4 }))).toBe(false);
    expect(rule.check(makeCtx({ totalSubmissions: 5 }))).toBe(true);
  });

  it('TEN_SUBMITS unlocks at 10', () => {
    const rule = findRule('TEN_SUBMITS');
    expect(rule.check(makeCtx({ totalSubmissions: 9 }))).toBe(false);
    expect(rule.check(makeCtx({ totalSubmissions: 10 }))).toBe(true);
  });

  it('TWENTY_FIVE_SUBMITS unlocks at 25', () => {
    const rule = findRule('TWENTY_FIVE_SUBMITS');
    expect(rule.check(makeCtx({ totalSubmissions: 24 }))).toBe(false);
    expect(rule.check(makeCtx({ totalSubmissions: 25 }))).toBe(true);
  });
});

describe('Improvement achievements', () => {
  it('FIRST_IMPROVE unlocks at 1 improvement', () => {
    const rule = findRule('FIRST_IMPROVE');
    expect(rule.check(makeCtx({ improvementCount: 0 }))).toBe(false);
    expect(rule.check(makeCtx({ improvementCount: 1 }))).toBe(true);
  });

  it('THREE_IMPROVES unlocks at 3', () => {
    const rule = findRule('THREE_IMPROVES');
    expect(rule.check(makeCtx({ improvementCount: 2 }))).toBe(false);
    expect(rule.check(makeCtx({ improvementCount: 3 }))).toBe(true);
  });
});

describe('Mastery achievements', () => {
  it('BAND_4 unlocks at band 4', () => {
    const rule = findRule('BAND_4');
    expect(rule.check(makeCtx({ highestBand: 3 }))).toBe(false);
    expect(rule.check(makeCtx({ highestBand: 4 }))).toBe(true);
  });

  it('BAND_5 unlocks at band 5', () => {
    const rule = findRule('BAND_5');
    expect(rule.check(makeCtx({ highestBand: 4 }))).toBe(false);
    expect(rule.check(makeCtx({ highestBand: 5 }))).toBe(true);
  });

  it('BOTH_TYPES unlocks with 2 types', () => {
    const rule = findRule('BOTH_TYPES');
    expect(rule.check(makeCtx({ essayTypesAttempted: new Set(['situational']) }))).toBe(false);
    expect(rule.check(makeCtx({ essayTypesAttempted: new Set(['situational', 'continuous']) }))).toBe(true);
  });
});

describe('Streak achievements', () => {
  it('STREAK_3 unlocks at 3-day streak', () => {
    const rule = findRule('STREAK_3');
    expect(rule.check(makeCtx({ currentStreak: 2, longestStreak: 2 }))).toBe(false);
    expect(rule.check(makeCtx({ currentStreak: 3, longestStreak: 3 }))).toBe(true);
  });

  it('STREAK_7 checks longest streak too', () => {
    const rule = findRule('STREAK_7');
    expect(rule.check(makeCtx({ currentStreak: 2, longestStreak: 7 }))).toBe(true);
  });
});
