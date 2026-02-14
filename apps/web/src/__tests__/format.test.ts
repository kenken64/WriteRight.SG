import { describe, it, expect } from 'vitest';
import {
  formatScore, formatBand, getBandColor, formatConfidence,
  formatRelativeDate, formatStatus, getRewardEmoji,
} from '@/lib/utils/format';

describe('formatScore', () => {
  it('formats score correctly', () => {
    expect(formatScore(20, 30)).toBe('20 / 30');
    expect(formatScore(0, 30)).toBe('0 / 30');
  });
});

describe('formatBand', () => {
  it('formats band 0 as no creditable response', () => {
    expect(formatBand(0)).toContain('Band 0');
    expect(formatBand(0)).toContain('No creditable');
  });

  it('formats bands 1-5', () => {
    expect(formatBand(1)).toBe('Band 1');
    expect(formatBand(5)).toBe('Band 5');
  });
});

describe('getBandColor', () => {
  it('returns correct colors for each band', () => {
    expect(getBandColor(0)).toContain('gray');
    expect(getBandColor(1)).toContain('red');
    expect(getBandColor(2)).toContain('orange');
    expect(getBandColor(3)).toContain('yellow');
    expect(getBandColor(4)).toContain('blue');
    expect(getBandColor(5)).toContain('green');
  });

  it('returns fallback for unknown band', () => {
    expect(getBandColor(99)).toContain('gray');
  });
});

describe('formatConfidence', () => {
  it('formats as percentage', () => {
    expect(formatConfidence(0.95)).toBe('95%');
    expect(formatConfidence(0.7)).toBe('70%');
    expect(formatConfidence(1)).toBe('100%');
    expect(formatConfidence(0)).toBe('0%');
  });
});

describe('formatRelativeDate', () => {
  it('returns "Just now" for very recent', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Just now');
  });

  it('returns minutes for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeDate(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours for same-day dates', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeDate(threeHoursAgo)).toBe('3h ago');
  });
});

describe('formatStatus', () => {
  it('returns correct labels', () => {
    expect(formatStatus('draft').label).toBe('Draft');
    expect(formatStatus('evaluated').label).toBe('Marked');
    expect(formatStatus('failed').label).toBe('Failed');
  });

  it('returns fallback for unknown status', () => {
    expect(formatStatus('unknown').label).toBe('unknown');
  });
});

describe('getRewardEmoji', () => {
  it('returns correct emojis', () => {
    expect(getRewardEmoji('treat')).toBe('🍦');
    expect(getRewardEmoji('screen_time')).toBe('🎮');
    expect(getRewardEmoji('book')).toBe('📖');
  });

  it('returns gift for unknown type', () => {
    expect(getRewardEmoji('xyz')).toBe('🎁');
  });
});
