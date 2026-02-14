import { describe, it, expect } from 'vitest';
import { computeDiff, getDiffStats } from '../rewrite/diff';

describe('computeDiff', () => {
  it('returns unchanged for identical text', () => {
    const diff = computeDiff('hello world', 'hello world');
    expect(diff).toHaveLength(1);
    expect(diff[0].type).toBe('unchanged');
    expect(diff[0].value).toBe('hello world');
  });

  it('detects added words', () => {
    const diff = computeDiff('hello world', 'hello beautiful world');
    const added = diff.filter((d) => d.type === 'add');
    expect(added.length).toBeGreaterThan(0);
    expect(added.some((d) => d.value.includes('beautiful'))).toBe(true);
  });

  it('detects removed words', () => {
    const diff = computeDiff('hello beautiful world', 'hello world');
    const removed = diff.filter((d) => d.type === 'remove');
    expect(removed.length).toBeGreaterThan(0);
  });

  it('handles complete replacement', () => {
    const diff = computeDiff('cat', 'dog');
    expect(diff.some((d) => d.type === 'add')).toBe(true);
    expect(diff.some((d) => d.type === 'remove')).toBe(true);
  });

  it('handles empty strings', () => {
    const diff = computeDiff('', 'new text');
    expect(diff.some((d) => d.type === 'add')).toBe(true);
  });
});

describe('getDiffStats', () => {
  it('returns zero changes for identical text', () => {
    const diff = computeDiff('hello world', 'hello world');
    const stats = getDiffStats(diff);
    expect(stats.addedWords).toBe(0);
    expect(stats.removedWords).toBe(0);
    expect(stats.changePercentage).toBe(0);
  });

  it('counts added and removed words', () => {
    const diff = computeDiff('the cat sat', 'the dog sat quietly');
    const stats = getDiffStats(diff);
    expect(stats.addedWords).toBeGreaterThan(0);
    expect(stats.removedWords).toBeGreaterThan(0);
  });

  it('calculates change percentage', () => {
    const diff = computeDiff('one two three four', 'one five three four');
    const stats = getDiffStats(diff);
    expect(stats.changePercentage).toBeGreaterThan(0);
    expect(stats.changePercentage).toBeLessThanOrEqual(100);
  });

  it('handles all-new text', () => {
    const diff = computeDiff('', 'brand new text here');
    const stats = getDiffStats(diff);
    expect(stats.addedWords).toBeGreaterThan(0);
    expect(stats.unchangedWords).toBe(0);
  });
});
