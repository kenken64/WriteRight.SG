import { describe, it, expect } from 'vitest';
import { checkAchievements, getNewlyUnlocked } from '../achievements/engine';
import type { AchievementContext } from '../achievements/rules';

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

describe('checkAchievements', () => {
  it('returns results for all rules when none unlocked', () => {
    const results = checkAchievements(makeCtx(), new Set());
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r).toHaveProperty('achievementCode');
      expect(r).toHaveProperty('unlocked');
      expect(r).toHaveProperty('progress');
      expect(r).toHaveProperty('target');
    });
  });

  it('skips already unlocked achievements', () => {
    const all = checkAchievements(makeCtx(), new Set());
    const withUnlocked = checkAchievements(makeCtx(), new Set(['FIRST_SUBMIT']));
    expect(withUnlocked.length).toBe(all.length - 1);
    expect(withUnlocked.find((r) => r.achievementCode === 'FIRST_SUBMIT')).toBeUndefined();
  });

  it('marks FIRST_SUBMIT as unlocked at 1 submission', () => {
    const results = checkAchievements(makeCtx({ totalSubmissions: 1 }), new Set());
    const first = results.find((r) => r.achievementCode === 'FIRST_SUBMIT')!;
    expect(first.unlocked).toBe(true);
    expect(first.progress).toBe(1);
    expect(first.target).toBe(1);
  });

  it('shows progress for partial completion', () => {
    const results = checkAchievements(makeCtx({ totalSubmissions: 3 }), new Set());
    const five = results.find((r) => r.achievementCode === 'FIVE_SUBMITS')!;
    expect(five.unlocked).toBe(false);
    expect(five.progress).toBe(3);
    expect(five.target).toBe(5);
  });

  it('caps progress at target', () => {
    const results = checkAchievements(makeCtx({ totalSubmissions: 100 }), new Set());
    const five = results.find((r) => r.achievementCode === 'FIVE_SUBMITS')!;
    expect(five.progress).toBe(5);
  });
});

describe('getNewlyUnlocked', () => {
  it('returns empty array when nothing new unlocked', () => {
    const result = getNewlyUnlocked(makeCtx(), new Set());
    expect(result).toEqual([]);
  });

  it('returns newly unlocked rules', () => {
    const result = getNewlyUnlocked(makeCtx({ totalSubmissions: 1 }), new Set());
    expect(result.some((r) => r.code === 'FIRST_SUBMIT')).toBe(true);
  });

  it('does not return already unlocked', () => {
    const result = getNewlyUnlocked(makeCtx({ totalSubmissions: 1 }), new Set(['FIRST_SUBMIT']));
    expect(result.find((r) => r.code === 'FIRST_SUBMIT')).toBeUndefined();
  });

  it('returns multiple newly unlocked at once', () => {
    const ctx = makeCtx({ totalSubmissions: 5, improvementCount: 1 });
    const result = getNewlyUnlocked(ctx, new Set());
    const codes = result.map((r) => r.code);
    expect(codes).toContain('FIRST_SUBMIT');
    expect(codes).toContain('FIVE_SUBMITS');
    expect(codes).toContain('FIRST_IMPROVE');
  });
});
