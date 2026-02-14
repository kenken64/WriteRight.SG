import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateStreak } from '../achievements/streak';

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeros for empty array', () => {
    const result = calculateStreak([]);
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0, lastSubmissionDate: null, streakActive: false });
  });

  it('returns 1-day streak for single submission today', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const result = calculateStreak(['2024-06-15T10:00:00Z']);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.streakActive).toBe(true);
  });

  it('counts consecutive days', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-15T10:00:00Z',
      '2024-06-14T10:00:00Z',
      '2024-06-13T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.streakActive).toBe(true);
  });

  it('breaks streak on gap', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-15T10:00:00Z',
      '2024-06-13T10:00:00Z', // gap on 14th
      '2024-06-12T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(2); // 12-13
  });

  it('deduplicates same-day multiple submissions', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-15T08:00:00Z',
      '2024-06-15T14:00:00Z',
      '2024-06-15T20:00:00Z',
      '2024-06-14T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(2);
    expect(result.longestStreak).toBe(2);
  });

  it('counts yesterday submission as active streak', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-14T10:00:00Z',
      '2024-06-13T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(2);
    expect(result.streakActive).toBe(true);
  });

  it('streak not active if last submission is 2+ days ago', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-12T10:00:00Z',
      '2024-06-11T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(0);
    expect(result.streakActive).toBe(false);
    expect(result.longestStreak).toBe(2);
  });

  it('tracks longest streak separately from current', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-15T10:00:00Z',
      // gap
      '2024-06-10T10:00:00Z',
      '2024-06-09T10:00:00Z',
      '2024-06-08T10:00:00Z',
      '2024-06-07T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(4);
  });

  it('handles unsorted input', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const dates = [
      '2024-06-13T10:00:00Z',
      '2024-06-15T10:00:00Z',
      '2024-06-14T10:00:00Z',
    ];
    const result = calculateStreak(dates);
    expect(result.currentStreak).toBe(3);
  });

  it('returns lastSubmissionDate as most recent day', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const result = calculateStreak(['2024-06-14T10:00:00Z', '2024-06-10T10:00:00Z']);
    expect(result.lastSubmissionDate).toBe('2024-06-14');
  });
});
